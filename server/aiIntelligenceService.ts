import { GoogleGenAI, Type } from '@google/genai';

export interface NextMealSuggestion {
  id: string;
  name: string;
  mealType: string;
  description: string;
  prepTimeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
  instructions: string[];
  whyThisFits: string;
}

export interface WeeklyNutritionReview {
  period: string;
  overallScore: number; // 0-100
  verdict: 'Excelente' | 'Bom' | 'Atenção Necessária' | 'Ajuste Crítico';
  summary: string;
  strengths: string[];
  improvements: string[];
  calorieCompliancePercent: number;
  proteinCompliancePercent: number;
  suggestedActionPlan: string[];
}

export interface BodyCompositionAnalysis {
  estimatedBodyFatPercent: number;
  leanMassKg: number;
  fatMassKg: number;
  bmrEstimatedKcal: number;
  tdeeEstimatedKcal: number;
  weeklyWeightRateKg: number;
  projectedGoalWeeks: number;
  projectedGoalDate: string;
  evaluation: string;
  coachTips: string[];
}

export interface BusinessGrowthInsights {
  healthScore: number; // 0-100
  summary: string;
  mrrProjectedNextMonth: number;
  topOpportunities: string[];
  recommendedCampaign: {
    title: string;
    description: string;
    targetSegment: string;
    discountPercent: number;
  };
}

/**
 * Generates 3 intelligent next meal options based on remaining macros and user goals
 */
export async function generateNextMealSuggestions(
  ai: GoogleGenAI | null,
  context: {
    remainingCalories: number;
    remainingProtein: number;
    remainingCarbs: number;
    remainingFat: number;
    goal: string;
    preferredMealType?: string;
    dietaryRestrictions?: string[];
  }
): Promise<NextMealSuggestion[]> {
  const targetKcal = Math.max(150, Math.round(context.remainingCalories));
  const targetProt = Math.max(10, Math.round(context.remainingProtein));
  const targetCarb = Math.max(10, Math.round(context.remainingCarbs));
  const targetFat = Math.max(5, Math.round(context.remainingFat));

  const defaultSuggestions: NextMealSuggestion[] = [
    {
      id: 'sug_1',
      name: 'Omelete Proteica com Queijo Branco e Tomate',
      mealType: context.preferredMealType || 'snack',
      description: 'Omelete leve com alto teor de aminoácidos essenciais e baixo carboidrato.',
      prepTimeMinutes: 10,
      calories: Math.min(targetKcal, 320),
      protein: Math.min(targetProt, 28),
      carbs: 6,
      fat: 16,
      ingredients: [
        { name: 'Ovos inteiros', quantity: 2, unit: 'unid', calories: 140, protein: 13, carbs: 1, fat: 10 },
        { name: 'Clara de ovo', quantity: 2, unit: 'unid', calories: 35, protein: 7, carbs: 0, fat: 0 },
        { name: 'Queijo minas frescal ou cottage', quantity: 40, unit: 'g', calories: 105, protein: 7, carbs: 1, fat: 8 },
        { name: 'Tomate picado e orégano', quantity: 50, unit: 'g', calories: 15, protein: 1, carbs: 3, fat: 0 },
      ],
      instructions: [
        'Bata os ovos e as claras em uma tigela com uma pitada de sal e orégano.',
        'Aqueça uma frigideira antiaderente levemente untada.',
        'Despeje os ovos, adicione o queijo e tomate picados, dobre e doure por 3 minutos.',
      ],
      whyThisFits: 'Fornece proteína de altíssimo valor biológico para saciedade e recuperação muscular sem extrapolar os carboidratos.',
    },
    {
      id: 'sug_2',
      name: 'Bowl de Frango Grelhado com Arroz e Brócolis',
      mealType: context.preferredMealType || 'dinner',
      description: 'Prato esportivo clássico, de digestão limpa e densidade nutricional ótima.',
      prepTimeMinutes: 15,
      calories: Math.min(targetKcal, 450),
      protein: Math.min(targetProt, 42),
      carbs: Math.min(targetCarb, 45),
      fat: 8,
      ingredients: [
        { name: 'Peito de frango grelhado', quantity: 150, unit: 'g', calories: 238, protein: 48, carbs: 0, fat: 4 },
        { name: 'Arroz branco ou integral cozido', quantity: 120, unit: 'g', calories: 150, protein: 3, carbs: 33, fat: 1 },
        { name: 'Brócolis no vapor com azeite', quantity: 100, unit: 'g', calories: 45, protein: 2, carbs: 4, fat: 2 },
      ],
      instructions: [
        'Grelhe os filés de peito de frango temperados com sal, alho e páprica.',
        'Aqueça o arroz cozido e cozinhe o brócolis no vapor por 4 minutos.',
        'Monte o bowl equilibrado e sirva.',
      ],
      whyThisFits: 'Combinação perfeita de carboidratos complexos e proteína magra para fechar o balanço energético com precisão.',
    },
    {
      id: 'sug_3',
      name: 'Shake Anabólico de Whey com Banana e Aveia',
      mealType: context.preferredMealType || 'snack',
      description: 'Lanche prático, cremoso e rico em fibras e proteínas solúveis.',
      prepTimeMinutes: 5,
      calories: Math.min(targetKcal, 310),
      protein: Math.min(targetProt, 32),
      carbs: Math.min(targetCarb, 38),
      fat: 4,
      ingredients: [
        { name: 'Whey Protein (baunilha ou chocolate)', quantity: 30, unit: 'g', calories: 120, protein: 24, carbs: 2, fat: 2 },
        { name: 'Banana prata fatiada', quantity: 80, unit: 'g', calories: 78, protein: 1, carbs: 20, fat: 0 },
        { name: 'Aveia em flocos finos', quantity: 30, unit: 'g', calories: 110, protein: 4, carbs: 18, fat: 2 },
        { name: 'Água gelada ou leite desnatado', quantity: 250, unit: 'ml', calories: 0, protein: 0, carbs: 0, fat: 0 },
      ],
      instructions: [
        'Coloque a água ou leite desnatado no liquidificador.',
        'Adicione o scoop de whey, a banana e a aveia em flocos.',
        'Bata em alta velocidade por 40 segundos e consuma imediatamente.',
      ],
      whyThisFits: 'Entrega rápida de aminoácidos com carboidratos de liberação gradual, ideal para complementar o dia.',
    },
  ];

  if (!ai) return defaultSuggestions;

  try {
    const prompt = `Você é o NutriMacro AI Chef & Nutricionista Esportivo.
O usuário tem as seguintes metas RESTANTES para o dia de hoje:
- Calorias restantes: ${targetKcal} kcal
- Proteína restante: ${targetProt}g
- Carboidratos restantes: ${targetCarb}g
- Gorduras restantes: ${targetFat}g
- Objetivo do usuário: ${context.goal}
- Tipo preferido de refeição: ${context.preferredMealType || 'próxima refeição'}

Gere 3 opções EXTREMAMENTE saborosas, práticas e realistas da culinária brasileira que se encaixem com precisão quase matemática nos macros restantes.
Retorne em JSON estruturado com lista de 3 opções.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  mealType: { type: Type.STRING },
                  description: { type: Type.STRING },
                  prepTimeMinutes: { type: Type.NUMBER },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        quantity: { type: Type.NUMBER },
                        unit: { type: Type.STRING },
                        calories: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER },
                      },
                      required: ['name', 'quantity', 'unit', 'calories', 'protein', 'carbs', 'fat'],
                    },
                  },
                  instructions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  whyThisFits: { type: Type.STRING },
                },
                required: [
                  'name',
                  'mealType',
                  'description',
                  'prepTimeMinutes',
                  'calories',
                  'protein',
                  'carbs',
                  'fat',
                  'ingredients',
                  'instructions',
                  'whyThisFits',
                ],
              },
            },
          },
          required: ['suggestions'],
        },
      },
    });

    if (res.text) {
      const parsed = JSON.parse(res.text);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        return parsed.suggestions.map((s: any, idx: number) => ({
          ...s,
          id: `ai_sug_${Date.now()}_${idx}`,
        }));
      }
    }
    return defaultSuggestions;
  } catch (err: any) {
    console.warn('[Gemini Next Meal Suggestion Warning]:', err?.message || err);
    return defaultSuggestions;
  }
}

/**
 * Conducts a comprehensive weekly nutrition review
 */
export async function generateWeeklyNutritionReview(
  ai: GoogleGenAI | null,
  data: {
    userName: string;
    goal: string;
    targetCalories: number;
    targetProtein: number;
    daysCount: number;
    averageCalories: number;
    averageProtein: number;
    dailyHistory: Array<{ date: string; calories: number; protein: number; mealsCount: number }>;
  }
): Promise<WeeklyNutritionReview> {
  const calDiff = Math.round(data.averageCalories - data.targetCalories);
  const protDiff = Math.round(data.averageProtein - data.targetProtein);
  const calCompliance = Math.max(0, Math.min(100, Math.round(100 - (Math.abs(calDiff) / data.targetCalories) * 100)));
  const protCompliance = Math.max(0, Math.min(100, Math.round((data.averageProtein / data.targetProtein) * 100)));

  const defaultReview: WeeklyNutritionReview = {
    period: 'Últimos 7 dias',
    overallScore: Math.round((calCompliance + protCompliance) / 2),
    verdict: calCompliance >= 85 && protCompliance >= 90 ? 'Excelente' : calCompliance >= 70 ? 'Bom' : 'Atenção Necessária',
    summary: `Nos últimos ${data.daysCount} dias, você manteve uma média de ${data.averageCalories} kcal (meta: ${data.targetCalories} kcal) e ${data.averageProtein}g de proteína (meta: ${data.targetProtein}g).`,
    strengths: [
      `Consistência de registro ativa em ${data.daysCount} dias.`,
      protCompliance >= 85 ? 'Excelente aporte proteico para manutenção de massa magra.' : 'Boa distribuição de refeições ao longo dos dias.',
    ],
    improvements: [
      calDiff > 200 ? 'Atenção ao superávit calórico não planejado aos finais de semana.' : 'Buscar maior regularidade nos horários das refeições.',
      protCompliance < 85 ? `Aumentar em cerca de ${Math.abs(protDiff)}g a ingestão diária de proteínas.` : 'Continuar com hidratação alta.',
    ],
    calorieCompliancePercent: calCompliance,
    proteinCompliancePercent: protCompliance,
    suggestedActionPlan: [
      'Planejar as 2 principais fontes de proteína logo pela manhã.',
      'Manter meta de hidratação acima de 35ml por kg de peso corporal.',
      'Utilizar a câmera ou voz para registrar lanches intermediários sem esquecer.',
    ],
  };

  if (!ai) return defaultReview;

  try {
    const prompt = `Você é o Diretor Clínico e Esportivo do NutriMacro.
Analise a performance semanal do usuário com base nos dados reais:
- Nome: ${data.userName}
- Objetivo: ${data.goal}
- Meta diária de calorias: ${data.targetCalories} kcal (Média real: ${data.averageCalories} kcal)
- Meta diária de proteína: ${data.targetProtein}g (Média real: ${data.averageProtein}g)
- Dias com registro: ${data.daysCount}
- Histórico: ${JSON.stringify(data.dailyHistory)}

Gere um diagnóstico semanal aprofundado, encorajador, rigoroso cientificamente e acionável em Português do Brasil.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.25,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            verdict: { type: Type.STRING },
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedActionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['overallScore', 'verdict', 'summary', 'strengths', 'improvements', 'suggestedActionPlan'],
        },
      },
    });

    if (res.text) {
      const parsed = JSON.parse(res.text);
      return {
        ...defaultReview,
        overallScore: Math.round(Number(parsed.overallScore) || defaultReview.overallScore),
        verdict: parsed.verdict || defaultReview.verdict,
        summary: parsed.summary || defaultReview.summary,
        strengths: parsed.strengths || defaultReview.strengths,
        improvements: parsed.improvements || defaultReview.improvements,
        suggestedActionPlan: parsed.suggestedActionPlan || defaultReview.suggestedActionPlan,
      };
    }
    return defaultReview;
  } catch (err: any) {
    console.warn('[Gemini Weekly Review Warning]:', err?.message || err);
    return defaultReview;
  }
}

/**
 * Calculates body composition estimates and time to goal projection
 */
export async function generateBodyCompositionAnalysis(
  ai: GoogleGenAI | null,
  profile: {
    name: string;
    gender: string;
    age: number;
    heightCm: number;
    currentWeightKg: number;
    targetWeightKg: number;
    goal: string;
    waistCm?: number;
    armCm?: number;
  }
): Promise<BodyCompositionAnalysis> {
  // Scientific formulas (Mifflin-St Jeor & Navy circumference estimates)
  const isMale = profile.gender === 'male';
  const hM = profile.heightCm / 100;
  const bmi = profile.currentWeightKg / (hM * hM);

  // Deurenberg BMI body fat formula estimation
  let estimatedBf = 1.2 * bmi + 0.23 * profile.age - (isMale ? 16.2 : 5.4);
  estimatedBf = Math.max(8, Math.min(48, Math.round(estimatedBf * 10) / 10));

  const fatMass = Math.round(((profile.currentWeightKg * estimatedBf) / 100) * 10) / 10;
  const leanMass = Math.round((profile.currentWeightKg - fatMass) * 10) / 10;

  // BMR via Mifflin-St Jeor
  const bmr = Math.round(
    isMale
      ? 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
      : 10 * profile.currentWeightKg + 6.25 * profile.heightCm - 5 * profile.age - 161
  );
  const tdee = Math.round(bmr * 1.55);

  const weightDelta = Math.abs(profile.currentWeightKg - profile.targetWeightKg);
  // Average healthy rate: 0.5kg per week
  const weeksToGoal = Math.max(1, Math.round((weightDelta / 0.5) * 10) / 10);

  const goalDate = new Date();
  goalDate.setDate(goalDate.getDate() + Math.round(weeksToGoal * 7));

  const defaultAnalysis: BodyCompositionAnalysis = {
    estimatedBodyFatPercent: estimatedBf,
    leanMassKg: leanMass,
    fatMassKg: fatMass,
    bmrEstimatedKcal: bmr,
    tdeeEstimatedKcal: tdee,
    weeklyWeightRateKg: profile.goal === 'cutting' || profile.goal === 'weight_loss' ? -0.5 : 0.3,
    projectedGoalWeeks: Math.ceil(weeksToGoal),
    projectedGoalDate: goalDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }),
    evaluation: `Com base em ${profile.currentWeightKg}kg e ${profile.heightCm}cm, sua taxa metabólica basal é de aproximadamente ${bmr} kcal/dia e gasto energético total de ${tdee} kcal/dia.`,
    coachTips: [
      'Priorize ingestão de proteína em todas as refeições para preservar massa magra.',
      'Monitore medidas de cintura a cada 14 dias para confirmar perda de gordura visceral.',
      'Mantenha consistência no registro diário dos macros para garantir o ritmo planejado.',
    ],
  };

  if (!ai) return defaultAnalysis;

  try {
    const prompt = `Você é um Fisiologista do Exercício e Nutricionista Esportivo.
Analise os dados antropométricos do atleta:
- Nome: ${profile.name}
- Gênero: ${profile.gender}
- Idade: ${profile.age} anos
- Altura: ${profile.heightCm} cm
- Peso Atual: ${profile.currentWeightKg} kg (Meta: ${profile.targetWeightKg} kg)
- Objetivo: ${profile.goal}
- Medidas: Cintura ${profile.waistCm || 'N/A'}cm, Braço ${profile.armCm || 'N/A'}cm

Forneça uma avaliação profissional da taxa esperada de evolução e 3 orientações práticas para acelerar o resultado.`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            evaluation: { type: Type.STRING },
            coachTips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['evaluation', 'coachTips'],
        },
      },
    });

    if (res.text) {
      const parsed = JSON.parse(res.text);
      return {
        ...defaultAnalysis,
        evaluation: parsed.evaluation || defaultAnalysis.evaluation,
        coachTips: parsed.coachTips || defaultAnalysis.coachTips,
      };
    }
    return defaultAnalysis;
  } catch (err: any) {
    console.warn('[Gemini Body Composition Warning]:', err?.message || err);
    return defaultAnalysis;
  }
}
