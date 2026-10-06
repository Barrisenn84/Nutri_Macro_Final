import { TacoFoodItem, searchTacoDatabase, TACO_DATABASE } from './tacoDatabase';
import { GoogleGenAI, Type } from '@google/genai';

export interface UnifiedFoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  category: string;
  barcode?: string;
  imageUrl?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g?: number;
  unit: string;
  defaultServingG: number;
  source: 'TACO' | 'OPEN_FOOD_FACTS' | 'GEMINI_AI';
}

// In-memory cache for fast responsive searches
const cache = new Map<string, { timestamp: number; data: UnifiedFoodSearchResult[] }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Searches Open Food Facts API (Free public Brazilian & global product database)
 */
export async function searchOpenFoodFacts(query: string): Promise<UnifiedFoodSearchResult[]> {
  try {
    const encoded = encodeURIComponent(query.trim());
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encoded}&search_simple=1&action=process&json=1&page_size=12&lc=pt`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NutriMacro-App - Android/iOS/Web - Version 2.0 (solutionreveai@gmail.com)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const json = await res.json();
    const products: any[] = json.products || [];

    const results: UnifiedFoodSearchResult[] = [];

    for (const p of products) {
      const name = p.product_name_pt || p.product_name || p.generic_name_pt || p.generic_name;
      if (!name || name.trim().length < 2) continue;

      const nutriments = p.nutriments || {};
      const kcal = Math.round(
        Number(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal_value'] ?? nutriments['energy-kcal'] ?? 0)
      );
      const protein = Number(Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0).toFixed(1));
      const carbs = Number(Number(nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0).toFixed(1));
      const fat = Number(Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0).toFixed(1));
      const fiber = Number(Number(nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0).toFixed(1));

      // Skip invalid items with zero calories and zero macros
      if (kcal === 0 && protein === 0 && carbs === 0 && fat === 0) continue;

      results.push({
        id: `off_${p.code || Math.random().toString(36).substring(7)}`,
        name: name.trim(),
        brand: p.brands || undefined,
        category: p.categories_tags?.[0]?.replace('en:', '').replace('pt:', '') || 'Industrializados',
        barcode: p.code || undefined,
        imageUrl: p.image_front_small_url || p.image_url || undefined,
        caloriesPer100g: kcal,
        proteinPer100g: protein,
        carbsPer100g: carbs,
        fatPer100g: fat,
        fiberPer100g: fiber,
        unit: 'g',
        defaultServingG: 100,
        source: 'OPEN_FOOD_FACTS',
      });
    }

    return results;
  } catch (err: any) {
    console.warn('[OpenFoodFacts Search Warning]:', err?.message || err);
    return [];
  }
}

/**
 * Lookup by exact barcode in Open Food Facts
 */
export async function getProductByBarcode(barcode: string): Promise<UnifiedFoodSearchResult | null> {
  const cleanCode = barcode.trim();
  if (!cleanCode) return null;

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(cleanCode)}.json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'NutriMacro-App - Android/iOS/Web - Version 2.0 (solutionreveai@gmail.com)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    if (!data || data.status !== 1 || !data.product) return null;

    const p = data.product;
    const name = p.product_name_pt || p.product_name || p.generic_name_pt || p.generic_name || 'Produto com Código de Barras';
    const nutriments = p.nutriments || {};

    const kcal = Math.round(
      Number(nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal_value'] ?? nutriments['energy-kcal'] ?? 0)
    );
    const protein = Number(Number(nutriments['proteins_100g'] ?? nutriments['proteins'] ?? 0).toFixed(1));
    const carbs = Number(Number(nutriments['carbohydrates_100g'] ?? nutriments['carbohydrates'] ?? 0).toFixed(1));
    const fat = Number(Number(nutriments['fat_100g'] ?? nutriments['fat'] ?? 0).toFixed(1));
    const fiber = Number(Number(nutriments['fiber_100g'] ?? nutriments['fiber'] ?? 0).toFixed(1));

    return {
      id: `off_barcode_${cleanCode}`,
      name: name.trim(),
      brand: p.brands || undefined,
      category: p.categories_tags?.[0]?.replace('en:', '').replace('pt:', '') || 'Código de Barras',
      barcode: cleanCode,
      imageUrl: p.image_front_small_url || p.image_url || undefined,
      caloriesPer100g: kcal,
      proteinPer100g: protein,
      carbsPer100g: carbs,
      fatPer100g: fat,
      fiberPer100g: fiber,
      unit: 'g',
      defaultServingG: 100,
      source: 'OPEN_FOOD_FACTS',
    };
  } catch (err: any) {
    console.warn('[OpenFoodFacts Barcode Error]:', err?.message || err);
    return null;
  }
}

/**
 * Fallback to Gemini 3.8 AI estimation when an item/dish is not found in official tables
 */
export async function estimateFoodViaGemini(
  query: string,
  ai: GoogleGenAI | null
): Promise<UnifiedFoodSearchResult | null> {
  if (!ai || !query || query.trim().length < 2) return null;

  try {
    const prompt = `Você é um nutricionista especialista na tabela TACO e composição de alimentos.
Estime rigorosamente os macronutrientes para 100g ou 100ml do seguinte alimento/prato brasileiro: "${query.trim()}".
Retorne em JSON com calorias, proteína, carboidrato e gordura por 100g.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            caloriesPer100g: { type: Type.NUMBER },
            proteinPer100g: { type: Type.NUMBER },
            carbsPer100g: { type: Type.NUMBER },
            fatPer100g: { type: Type.NUMBER },
            defaultServingG: { type: Type.NUMBER },
            unit: { type: Type.STRING },
          },
          required: [
            'name',
            'category',
            'caloriesPer100g',
            'proteinPer100g',
            'carbsPer100g',
            'fatPer100g',
            'defaultServingG',
          ],
        },
      },
    });

    if (!res.text) return null;
    const parsed = JSON.parse(res.text);

    return {
      id: `gemini_est_${Date.now()}`,
      name: parsed.name || query.trim(),
      category: parsed.category || 'Estimativa IA',
      caloriesPer100g: Math.round(Number(parsed.caloriesPer100g) || 120),
      proteinPer100g: Number((Number(parsed.proteinPer100g) || 5).toFixed(1)),
      carbsPer100g: Number((Number(parsed.carbsPer100g) || 15).toFixed(1)),
      fatPer100g: Number((Number(parsed.fatPer100g) || 3).toFixed(1)),
      unit: parsed.unit || 'g',
      defaultServingG: Math.round(Number(parsed.defaultServingG) || 100),
      source: 'GEMINI_AI',
    };
  } catch (err: any) {
    console.warn('[Gemini Food Breakdown Error]:', err?.message || err);
    return null;
  }
}

/**
 * Unified Search: Combines TACO Database (fastest, guaranteed) + Open Food Facts API (brands/barcodes) + AI fallback
 */
export async function searchAllFoods(
  query: string,
  ai: GoogleGenAI | null
): Promise<UnifiedFoodSearchResult[]> {
  const clean = (query || '').trim().toLowerCase();

  // Return top TACO foods if query is empty
  if (!clean) {
    return TACO_DATABASE.slice(0, 15).map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      caloriesPer100g: t.caloriesPer100g,
      proteinPer100g: t.proteinPer100g,
      carbsPer100g: t.carbsPer100g,
      fatPer100g: t.fatPer100g,
      fiberPer100g: t.fiberPer100g,
      unit: t.unit,
      defaultServingG: t.defaultServingG,
      source: 'TACO',
    }));
  }

  // Check cache
  const cached = cache.get(clean);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Search TACO
  const tacoMatches = searchTacoDatabase(clean, 10).map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    caloriesPer100g: t.caloriesPer100g,
    proteinPer100g: t.proteinPer100g,
    carbsPer100g: t.carbsPer100g,
    fatPer100g: t.fatPer100g,
    fiberPer100g: t.fiberPer100g,
    unit: t.unit,
    defaultServingG: t.defaultServingG,
    source: 'TACO' as const,
  }));

  // 2. Search Open Food Facts in parallel
  let offMatches: UnifiedFoodSearchResult[] = [];
  try {
    offMatches = await searchOpenFoodFacts(clean);
  } catch {}

  // Combine results with TACO prioritized
  const combined: UnifiedFoodSearchResult[] = [...tacoMatches, ...offMatches];

  // If no results found, use Gemini AI estimation
  if (combined.length === 0 && ai) {
    const aiResult = await estimateFoodViaGemini(clean, ai);
    if (aiResult) {
      combined.push(aiResult);
    }
  }

  // Cache results
  cache.set(clean, { timestamp: Date.now(), data: combined });

  return combined;
}
