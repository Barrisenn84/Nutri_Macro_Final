import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Star,
  Clock,
  Plus,
  Barcode,
  Sparkles,
  Check,
  Flame,
  Globe,
  Loader2,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FoodDatabaseItem, UnifiedFoodSearchResult } from '../../types';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealId: string | null;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  mealId,
}) => {
  const { foodRepo, addItemToMeal, dailyMeals, allMeals, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'search' | 'barcode' | 'recent' | 'favorites' | 'custom'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [searchResults, setSearchResults] = useState<UnifiedFoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<UnifiedFoodSearchResult | null>(null);

  // Barcode specific state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  // Portion input
  const [portion, setPortion] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');

  // Custom food fields
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customQuantity, setCustomQuantity] = useState(100);
  const [customUnit, setCustomUnit] = useState('g');
  const [customCalories, setCustomCalories] = useState(150);
  const [customProtein, setCustomProtein] = useState(15);
  const [customCarbs, setCustomCarbs] = useState(10);
  const [customFat, setCustomFat] = useState(4);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);

  // Target meal: if mealId passed, use it; otherwise fallback to first meal of the day
  const effectiveMealId = mealId || (dailyMeals[0]?.id || allMeals[0]?.id);

  // Quick Brazilian Barcodes for instant testing
  const sampleBarcodes = [
    { code: '7891000100103', label: 'Leite Ninho Integral (Nestlé)' },
    { code: '7896005800262', label: 'Aveia em Flocos Quaker' },
    { code: '7898952458022', label: 'Whey Protein Concentrado Growth' },
    { code: '7898960481234', label: 'Pasta de Amendoim Integral Dr. Peanut' },
    { code: '7891025114130', label: 'Iogurte Natural Danone' },
  ];

  // Fetch foods on search query or tab change
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const controller = new AbortController();

    const fetchFoods = async () => {
      if (activeTab === 'recent') {
        const recent = await foodRepo.getRecentFoods();
        if (isMounted) {
          setSearchResults(
            recent.map((f) => ({
              id: f.id,
              name: f.name,
              category: f.category,
              caloriesPer100g: f.caloriesPer100g,
              proteinPer100g: f.proteinPer100g,
              carbsPer100g: f.carbsPer100g,
              fatPer100g: f.fatPer100g,
              unit: f.unit || 'g',
              defaultServingG: f.defaultQuantity || 100,
              source: 'TACO',
            }))
          );
        }
      } else if (activeTab === 'favorites') {
        const favs = await foodRepo.getFavoriteFoods();
        if (isMounted) {
          setSearchResults(
            favs.map((f) => ({
              id: f.id,
              name: f.name,
              category: f.category,
              caloriesPer100g: f.caloriesPer100g,
              proteinPer100g: f.proteinPer100g,
              carbsPer100g: f.carbsPer100g,
              fatPer100g: f.fatPer100g,
              unit: f.unit || 'g',
              defaultServingG: f.defaultQuantity || 100,
              source: 'TACO',
            }))
          );
        }
      } else if (activeTab === 'search') {
        setIsSearchingApi(true);
        try {
          const res = await fetch(`/api/foods/search?q=${encodeURIComponent(searchQuery)}`, {
            signal: controller.signal,
          });
          if (res.ok) {
            const data = await res.json();
            if (isMounted && data.success && Array.isArray(data.data)) {
              setSearchResults(data.data);
            }
          } else {
            // Fallback to local repo if server search fails
            const localResults = await foodRepo.searchFoods(searchQuery);
            if (isMounted) {
              setSearchResults(
                localResults.map((f) => ({
                  id: f.id,
                  name: f.name,
                  category: f.category,
                  caloriesPer100g: f.caloriesPer100g,
                  proteinPer100g: f.proteinPer100g,
                  carbsPer100g: f.carbsPer100g,
                  fatPer100g: f.fatPer100g,
                  unit: f.unit || 'g',
                  defaultServingG: f.defaultQuantity || 100,
                  source: 'TACO',
                }))
              );
            }
          }
        } catch (err: any) {
          if (err.name !== 'AbortError' && isMounted) {
            const localResults = await foodRepo.searchFoods(searchQuery);
            setSearchResults(
              localResults.map((f) => ({
                id: f.id,
                name: f.name,
                category: f.category,
                caloriesPer100g: f.caloriesPer100g,
                proteinPer100g: f.proteinPer100g,
                carbsPer100g: f.carbsPer100g,
                fatPer100g: f.fatPer100g,
                unit: f.unit || 'g',
                defaultServingG: f.defaultQuantity || 100,
                source: 'TACO',
              }))
            );
          }
        } finally {
          if (isMounted) setIsSearchingApi(false);
        }
      }
    };

    const timer = setTimeout(fetchFoods, activeTab === 'search' ? 250 : 0);
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [isOpen, activeTab, searchQuery, foodRepo]);

  if (!isOpen) return null;

  const handleSelectFoodItem = (food: UnifiedFoodSearchResult) => {
    setSelectedFood(food);
    setPortion(food.defaultServingG || 100);
    setUnit(food.unit || 'g');
  };

  const handleLookupBarcode = async (codeToSearch?: string) => {
    const code = (codeToSearch || barcodeInput).trim();
    if (!code) return;

    setIsScanningBarcode(true);
    setBarcodeError(null);

    try {
      const res = await fetch(`/api/foods/barcode/${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setSelectedFood(data.data);
        setPortion(data.data.defaultServingG || 100);
        setUnit(data.data.unit || 'g');
        showToast('Produto identificado via Open Food Facts!');
      } else {
        setBarcodeError('Código de barras não encontrado na base pública. Tente buscar pelo nome.');
      }
    } catch (err: any) {
      setBarcodeError('Erro ao consultar código de barras na rede.');
    } finally {
      setIsScanningBarcode(false);
    }
  };

  // Calculate live macros based on portion
  const calcNutrient = (per100: number) => {
    return Math.round(((per100 * portion) / 100) * 10) / 10;
  };

  const handleAddSelectedFoodToMeal = async () => {
    if (!effectiveMealId || !selectedFood) return;

    const calculatedCalories = Math.round((selectedFood.caloriesPer100g * portion) / 100);
    const calculatedProtein = calcNutrient(selectedFood.proteinPer100g);
    const calculatedCarbs = calcNutrient(selectedFood.carbsPer100g);
    const calculatedFat = calcNutrient(selectedFood.fatPer100g);

    await addItemToMeal(effectiveMealId, {
      name: selectedFood.name,
      description: selectedFood.brand ? `${selectedFood.brand} • ${selectedFood.category}` : selectedFood.category,
      quantity: Number(portion) || 100,
      unit,
      calories: calculatedCalories,
      protein: calculatedProtein,
      carbs: calculatedCarbs,
      fat: calculatedFat,
      source: selectedFood.source === 'OPEN_FOOD_FACTS' ? 'database' : selectedFood.source === 'GEMINI_AI' ? 'manual' : 'database',
      aiEstimate: selectedFood.source === 'GEMINI_AI',
    });

    showToast(`"${selectedFood.name}" adicionado à refeição!`);
    onClose();
  };

  const handleSaveCustomFood = async () => {
    if (!effectiveMealId || !customName.trim()) return;

    if (saveAsFavorite) {
      const per100Multiplier = 100 / (customQuantity || 100);
      await foodRepo.addCustomFood({
        name: customName.trim(),
        category: 'Personalizados',
        defaultQuantity: customQuantity,
        unit: customUnit,
        caloriesPer100g: Math.round(customCalories * per100Multiplier),
        proteinPer100g: Math.round(customProtein * per100Multiplier * 10) / 10,
        carbsPer100g: Math.round(customCarbs * per100Multiplier * 10) / 10,
        fatPer100g: Math.round(customFat * per100Multiplier * 10) / 10,
        isFavorite: true,
        isRecent: true,
      });
    }

    await addItemToMeal(effectiveMealId, {
      name: customName.trim(),
      description: customDescription.trim() || undefined,
      quantity: Number(customQuantity) || 100,
      unit: customUnit,
      calories: Number(customCalories) || 0,
      protein: Number(customProtein) || 0,
      carbs: Number(customCarbs) || 0,
      fat: Number(customFat) || 0,
      source: 'manual',
      aiEstimate: false,
    });

    showToast(`"${customName.trim()}" adicionado à refeição!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Adicionar Alimento</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                APIs Conectadas
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Busca unificada na Tabela TACO (UNICAMP), Open Food Facts (Produtos & Marcas) e IA de alta precisão
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            id="tab-food-search"
            onClick={() => {
              setActiveTab('search');
              setSelectedFood(null);
            }}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'search'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Busca TACO & Open Food Facts</span>
          </button>

          <button
            id="tab-food-barcode"
            onClick={() => {
              setActiveTab('barcode');
              setSelectedFood(null);
            }}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'barcode'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Código de Barras</span>
          </button>

          <button
            id="tab-food-recent"
            onClick={() => {
              setActiveTab('recent');
              setSelectedFood(null);
            }}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'recent'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Recentes</span>
          </button>

          <button
            id="tab-food-favs"
            onClick={() => {
              setActiveTab('favorites');
              setSelectedFood(null);
            }}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'favorites'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Favoritos</span>
          </button>

          <button
            id="tab-food-custom"
            onClick={() => {
              setActiveTab('custom');
              setSelectedFood(null);
            }}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'custom'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Manual</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'barcode' ? (
            /* Barcode Scanner & Lookup Tab */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white space-y-3">
                <div className="flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold">Leitor & Consulta por Código de Barras (EAN-13)</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Conectado gratuitamente à base mundial do <strong>Open Food Facts</strong> com milhões de produtos brasileiros cadastrados.
                </p>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLookupBarcode()}
                    placeholder="Digite ou cole o código de barras (ex: 7891000100103)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-emerald-500"
                  />
                  <button
                    onClick={() => handleLookupBarcode()}
                    disabled={isScanningBarcode || !barcodeInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    {isScanningBarcode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Consultar</span>
                  </button>
                </div>

                {barcodeError && (
                  <p className="text-xs text-rose-300 bg-rose-950/60 p-2 rounded-lg border border-rose-800/60">
                    {barcodeError}
                  </p>
                )}
              </div>

              {/* Sample Quick Barcodes */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Exemplos para Teste Imediato (Produtos Nacionais):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleBarcodes.map((sample) => (
                    <button
                      key={sample.code}
                      onClick={() => {
                        setBarcodeInput(sample.code);
                        handleLookupBarcode(sample.code);
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-emerald-800 text-xs">
                          {sample.label}
                        </p>
                        <p className="font-mono text-[10px] text-slate-400">{sample.code}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : activeTab !== 'custom' ? (
            <>
              {/* Search input with live API indicator */}
              {activeTab === 'search' && (
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome (ex: Peito de frango, Arroz, Feijão, Tapioca, Whey, Barra de Cereal...)"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-emerald-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  {isSearchingApi && (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin absolute right-3.5 top-3" />
                  )}
                </div>
              )}

              {/* Food List with Rich Metadata */}
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 space-y-2 text-slate-400 text-xs">
                    <Database className="w-8 h-8 mx-auto text-slate-300" />
                    <p>Nenhum alimento encontrado para o termo.</p>
                    <p className="text-[11px] text-slate-400">
                      Você pode buscar por outro nome ou criar um alimento manualmente na aba ao lado.
                    </p>
                  </div>
                ) : (
                  searchResults.map((food) => {
                    const isSelected = selectedFood?.id === food.id;
                    return (
                      <div
                        key={food.id}
                        onClick={() => handleSelectFoodItem(food)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {food.imageUrl ? (
                            <img
                              src={food.imageUrl}
                              alt={food.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {food.source === 'OPEN_FOOD_FACTS' ? 'OFF' : food.source === 'GEMINI_AI' ? 'IA' : 'TACO'}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-semibold text-slate-900 truncate">{food.name}</p>
                              {food.source === 'TACO' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800">
                                  🇧🇷 TACO Oficial
                                </span>
                              )}
                              {food.source === 'OPEN_FOOD_FACTS' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-blue-100 text-blue-800">
                                  🌐 Open Food Facts
                                </span>
                              )}
                              {food.source === 'GEMINI_AI' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-purple-100 text-purple-800 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" /> IA Estimativa
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {food.brand ? `${food.brand} • ` : ''}
                              {food.category} • Base por 100{food.unit}
                            </p>
                          </div>
                        </div>

                        <div className="text-right font-mono text-[11px] shrink-0 pl-2">
                          <span className="font-bold text-slate-800 block">
                            {food.caloriesPer100g} kcal
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {food.proteinPer100g}P • {food.carbsPer100g}C • {food.fatPer100g}G
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* Custom Food Form */
            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nome do Alimento *</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex: Iogurte Grego Caseiro"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Descrição / Marca (opcional)</label>
                  <input
                    type="text"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Ex: Desnatado com mel"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantidade Consumida</label>
                  <input
                    type="number"
                    value={customQuantity}
                    onChange={(e) => setCustomQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unidade</label>
                  <input
                    type="text"
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    placeholder="g, ml, un, fatia"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Macronutrientes da porção</span>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  <div>
                    <label className="text-[10px] text-slate-500 font-sans block">Calorias (kcal)</label>
                    <input
                      type="number"
                      value={customCalories}
                      onChange={(e) => setCustomCalories(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-sans block">Proteína (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-sans block">Carbo (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-sans block">Gordura (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customFat}
                      onChange={(e) => setCustomFat(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Food Portion Configurator (Shows when any item is chosen) */}
          {selectedFood && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-emerald-400 font-bold">Alimento Selecionado</span>
                    {selectedFood.source === 'TACO' && (
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                        TACO Oficial
                      </span>
                    )}
                    {selectedFood.source === 'OPEN_FOOD_FACTS' && (
                      <span className="text-[9px] px-1 py-0.2 bg-blue-500/20 text-blue-300 rounded font-semibold">
                        Open Food Facts
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">{selectedFood.name}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Porção:</label>
                  <input
                    type="number"
                    value={portion}
                    onChange={(e) => setPortion(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-2 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-center"
                  />
                  <span className="text-xs text-slate-400 font-mono">{unit}</span>
                </div>
              </div>

              {/* Dynamic recalculation */}
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs pt-1 border-t border-slate-800">
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="text-[10px] text-amber-400 font-sans block">Calorias</span>
                  <span className="font-extrabold text-white text-sm">
                    {Math.round((selectedFood.caloriesPer100g * portion) / 100)}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="text-[10px] text-emerald-400 font-sans block">Proteína</span>
                  <span className="font-bold text-emerald-300">
                    {calcNutrient(selectedFood.proteinPer100g)}g
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="text-[10px] text-blue-400 font-sans block">Carbo</span>
                  <span className="font-bold text-blue-300">
                    {calcNutrient(selectedFood.carbsPer100g)}g
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="text-[10px] text-purple-400 font-sans block">Gordura</span>
                  <span className="font-bold text-purple-300">
                    {calcNutrient(selectedFood.fatPer100g)}g
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          {activeTab === 'custom' ? (
            <button
              onClick={handleSaveCustomFood}
              disabled={!customName.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar e Adicionar</span>
            </button>
          ) : (
            <button
              onClick={handleAddSelectedFoodToMeal}
              disabled={!selectedFood}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar à Refeição</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
