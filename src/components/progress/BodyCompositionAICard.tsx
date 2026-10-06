import React, { useState } from 'react';
import { Sparkles, Activity, Calendar, Target, CheckCircle2, Loader2, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { BodyCompositionAnalysis } from '../../types';
import { useApp } from '../../context/AppContext';

export const BodyCompositionAICard: React.FC = () => {
  const { user, measurements, showToast } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BodyCompositionAnalysis | null>(null);

  const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null;

  const handleFetchAnalysis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/body-composition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user?.name || 'Atleta',
          gender: user?.gender || 'male',
          age: user?.age || 26,
          heightCm: user?.height || 178,
          currentWeightKg: user?.currentWeight || 78.5,
          targetWeightKg: user?.targetWeight || 74.0,
          goal: user?.goal || 'cutting',
          waistCm: latestMeasurement?.waist || undefined,
          armCm: latestMeasurement?.arm || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        setIsOpen(true);
        showToast('Composição corporal analisada com IA!');
      }
    } catch (err) {
      showToast('Falha ao analisar composição corporal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/60 shadow-md space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Análise de Composição & Projeção IA</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/30 text-indigo-300 font-mono font-semibold">
                Fisiologia Esportiva
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Estimativa de Gordura Corporal (%BF), Massa Magra, BMR, TDEE e data prevista de chegada na meta.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!analysis) handleFetchAnalysis();
            else setIsOpen(!isOpen);
          }}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md self-start sm:self-auto shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Calculando Antropometria...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{isOpen ? 'Ocultar Análise' : analysis ? 'Ver Projeção IA' : 'Calcular com IA'}</span>
            </>
          )}
        </button>
      </div>

      {isOpen && analysis && (
        <div className="pt-3 border-t border-slate-800 space-y-4 text-xs animate-in fade-in duration-200">
          {/* Key Anthropometric KPI Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5 font-mono">
              <span className="text-[10px] text-indigo-300 font-sans block uppercase font-bold">Gordura (%BF)</span>
              <span className="text-xl font-black text-white">{analysis.estimatedBodyFatPercent}%</span>
              <span className="text-[10px] text-slate-400 block font-sans">{analysis.fatMassKg} kg de gordura</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5 font-mono">
              <span className="text-[10px] text-emerald-400 font-sans block uppercase font-bold">Massa Magra</span>
              <span className="text-xl font-black text-emerald-300">{analysis.leanMassKg} kg</span>
              <span className="text-[10px] text-slate-400 block font-sans">Músculo & densidade</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5 font-mono">
              <span className="text-[10px] text-amber-400 font-sans block uppercase font-bold">Metabolismo Basal (BMR)</span>
              <span className="text-xl font-black text-white">{analysis.bmrEstimatedKcal}</span>
              <span className="text-[10px] text-slate-400 block font-sans">kcal/dia em repouso</span>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5 font-mono">
              <span className="text-[10px] text-blue-400 font-sans block uppercase font-bold">Gasto Total (TDEE)</span>
              <span className="text-xl font-black text-blue-300">{analysis.tdeeEstimatedKcal}</span>
              <span className="text-[10px] text-slate-400 block font-sans">kcal/dia com treino</span>
            </div>
          </div>

          {/* Goal Projection Date & Forecast */}
          <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white text-xs">Previsão de Conquista da Meta</span>
              </div>
              <p className="text-slate-300 text-xs">{analysis.evaluation}</p>
            </div>

            <div className="text-right sm:border-l sm:border-indigo-800/80 sm:pl-4 shrink-0">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Data Estimada</span>
              <span className="font-bold text-white text-sm block">{analysis.projectedGoalDate}</span>
              <span className="text-[10px] text-slate-400 font-mono">Em aprox. {analysis.projectedGoalWeeks} semanas</span>
            </div>
          </div>

          {/* Actionable Coach Tips */}
          {analysis.coachTips && analysis.coachTips.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] block">
                Diretrizes do Fisiologista / IA
              </span>
              <ul className="space-y-1 text-slate-300">
                {analysis.coachTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
