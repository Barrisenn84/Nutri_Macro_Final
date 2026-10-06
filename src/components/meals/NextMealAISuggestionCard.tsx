import React, { useState } from 'react';
import { Sparkles, Utensils, Clock, ChevronRight, Check, Plus, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NextMealSuggestion, MealType } from '../../types';

interface NextMealAISuggestionCardProps {
  remainingCalories: number;
  remainingProtein: number;
  remainingCarbs: number;
  remainingFat: number;
}

export const NextMealAISuggestionCard: React.FC<NextMealAISuggestionCardProps> = ({
  remainingCalories,
  remainingProtein,
  remainingCarbs,
  remainingFat,
}) => {
  const { user, createMeal, showToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<NextMealSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<NextMealSuggestion | null>(null);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/suggest-next-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remainingCalories: Math.max(100, remainingCalories),
          remainingProtein: Math.max(10, remainingProtein),
          remainingCarbs: Math.max(10, remainingCarbs),
          remainingFat: Math.max(5, remainingFat),
          goal: user?.goal || 'hypertrophy',
          preferredMealType: 'lunch',
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
        setSelectedSuggestion(data.suggestions[0] || null);
        setIsOpen(true);
        showToast('Opções balanceadas geradas pela IA!');
      }
    } catch (err) {
      showToast('Erro ao consultar sugestões de refeição.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestionToDiary = async (suggestion: NextMealSuggestion) => {
    try {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const dateStr = now.toISOString().split('T')[0];

      const validMealType: MealType =
        suggestion.mealType === 'breakfast' ||
        suggestion.mealType === 'lunch' ||
        suggestion.mealType === 'snack' ||
        suggestion.mealType === 'dinner' ||
        suggestion.mealType === 'supper'
          ? suggestion.mealType
          : 'snack';

      await createMeal({
        userId: user?.id || 'user',
        date: dateStr,
        time: timeStr,
        type: validMealType,
        name: suggestion.name,
        items: suggestion.ingredients.map((ing, idx) => ({
          id: `sug_item_${Date.now()}_${idx}`,
          mealId: '',
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          calories: ing.calories,
          protein: ing.protein,
          carbs: ing.carbs,
          fat: ing.fat,
          source: 'manual',
          aiEstimate: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      });

      showToast(`Refeição "${suggestion.name}" adicionada ao diário!`);
      setIsOpen(false);
    } catch (e) {
      showToast('Falha ao adicionar refeição ao diário.');
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white border border-emerald-800/60 shadow-md space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">IA Nutri-Chef: Próxima Refeição Perfeita</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-mono font-semibold">
                Calibrado nos Macros
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Saldo restante: <strong>{Math.max(0, remainingCalories)} kcal</strong> e{' '}
              <strong>{Math.max(0, Math.round(remainingProtein))}g proteína</strong>. Deixe a IA montar seu prato ideal!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (suggestions.length === 0) {
              fetchSuggestions();
            } else {
              setIsOpen(!isOpen);
            }
          }}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md self-start sm:self-auto shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculando Opções...</span>
            </>
          ) : (
            <>
              <Utensils className="w-4 h-4" />
              <span>{isOpen ? 'Ocultar Opções' : 'Sugerir Pratos (IA)'}</span>
            </>
          )}
        </button>
      </div>

      {/* Suggested Options Carousel / Cards */}
      {isOpen && suggestions.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((sug) => {
              const isSelected = selectedSuggestion?.id === sug.id;
              return (
                <div
                  key={sug.id}
                  onClick={() => setSelectedSuggestion(sug)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/95 border-emerald-400 ring-2 ring-emerald-500/20'
                      : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {sug.prepTimeMinutes} min
                      </span>
                      <span className="font-mono text-xs font-bold text-white">
                        {sug.calories} kcal
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-xs leading-snug">{sug.name}</h4>
                    <p className="text-[11px] text-slate-300 line-clamp-2">{sug.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
                    <span>{sug.protein}g P</span>
                    <span>{sug.carbs}g C</span>
                    <span>{sug.fat}g G</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Detail & Direct Add Button */}
          {selectedSuggestion && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedSuggestion.name}</h4>
                  <p className="text-xs text-emerald-400 mt-0.5">{selectedSuggestion.whyThisFits}</p>
                </div>

                <button
                  onClick={() => handleApplySuggestionToDiary(selectedSuggestion)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar ao Diário Agora</span>
                </button>
              </div>

              {/* Ingredients & Prep */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="space-y-1">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase">Ingredientes:</span>
                  <ul className="space-y-0.5 text-[11px]">
                    {selectedSuggestion.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span>• {ing.quantity} {ing.unit} {ing.name}</span>
                        <span className="font-mono text-slate-400">{ing.calories} kcal ({ing.protein}g P)</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase">Preparo Rápido:</span>
                  <ol className="space-y-0.5 list-decimal list-inside text-[11px] text-slate-300">
                    {selectedSuggestion.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
