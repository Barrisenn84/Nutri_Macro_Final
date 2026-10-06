import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Loader2, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { WeeklyNutritionReview } from '../../types';
import { useApp } from '../../context/AppContext';

interface WeeklyAIReviewCardProps {
  stats: {
    avgCals: number;
    avgProt: number;
    avgCarb: number;
    avgFat: number;
    daysLogged: number;
    totalDays: number;
    adherenceRate: number;
    calorieDiffVsTarget: number;
  };
  periodData: Array<{
    date: string;
    calories: number;
    protein: number;
  }>;
}

export const WeeklyAIReviewCard: React.FC<WeeklyAIReviewCardProps> = ({ stats, periodData }) => {
  const { user, targets, showToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [review, setReview] = useState<WeeklyNutritionReview | null>(null);

  const handleFetchReview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user?.name || 'Atleta',
          goal: user?.goal || 'hypertrophy',
          targetCalories: targets?.calories || 2500,
          targetProtein: targets?.protein || 160,
          daysCount: stats.daysLogged,
          averageCalories: stats.avgCals,
          averageProtein: stats.avgProt,
          dailyHistory: periodData.map((d) => ({
            date: d.date,
            calories: d.calories,
            protein: d.protein,
            mealsCount: d.calories > 0 ? 3 : 0,
          })),
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReview(data.review);
        setIsOpen(true);
        showToast('Auditoria nutricional semanal gerada com IA!');
      }
    } catch (err) {
      showToast('Falha ao gerar auditoria semanal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/60 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Auditoria & Diagnóstico Semanal por IA</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-500/30 text-teal-300 font-mono font-semibold">
                Clínico & Esportivo
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Análise aprofundada de aderência calórica, síntese proteica e consistência metabólica.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!review) handleFetchReview();
            else setIsOpen(!isOpen);
          }}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md self-start sm:self-auto shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Auditando Período...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{isOpen ? 'Ocultar Auditoria' : review ? 'Ver Diagnóstico IA' : 'Gerar Diagnóstico IA'}</span>
            </>
          )}
        </button>
      </div>

      {isOpen && review && (
        <div className="pt-3 border-t border-slate-800 space-y-4 text-xs animate-in fade-in duration-200">
          {/* Score Header */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-400 block tracking-wider">
                Veredito do Período
              </span>
              <h4 className="text-base font-black text-white mt-0.5">{review.verdict}</h4>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">{review.summary}</p>
            </div>

            <div className="text-right sm:border-l sm:border-white/10 sm:pl-5 shrink-0 self-start sm:self-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Score Geral</span>
              <span className="text-3xl font-black font-mono text-teal-300">{review.overallScore}</span>
              <span className="text-xs text-slate-400 font-mono">/100</span>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Pontos Fortes da Sua Consistência
              </span>
              <ul className="space-y-1.5 text-slate-200">
                {review.strengths?.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                Oportunidades de Ajuste Metabólico
              </span>
              <ul className="space-y-1.5 text-slate-200">
                {review.improvements?.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Plan */}
          {review.suggestedActionPlan && review.suggestedActionPlan.length > 0 && (
            <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/20 space-y-2">
              <span className="text-[11px] font-bold text-teal-300 uppercase tracking-wider block">
                Plano de Ação Prático para a Próxima Semana
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {review.suggestedActionPlan.map((action, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-teal-900/60 space-y-1">
                    <span className="font-bold font-mono text-[10px] text-teal-400">PASSO 0{i + 1}</span>
                    <p className="text-slate-300 text-[11px]">{action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
