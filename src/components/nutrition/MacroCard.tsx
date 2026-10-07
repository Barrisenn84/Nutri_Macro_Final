import React from 'react';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

export type MacroType = 'calories' | 'protein' | 'carbs' | 'fat';

interface MacroCardProps {
  type: MacroType;
  consumed: number;
  target: number;
  unit?: string;
  percent: number;
  remaining: number;
  isExceeded?: boolean;
  adjustedTarget?: number;
  activeBurnBonus?: number;
}

export const MacroCard: React.FC<MacroCardProps> = ({
  type,
  consumed,
  target,
  unit = 'g',
  percent,
  remaining,
  isExceeded = false,
  adjustedTarget,
  activeBurnBonus,
}) => {
  const configs: Record<
    MacroType,
    {
      title: string;
      icon: React.FC<{ className?: string }>;
      colorClass: string;
      bgClass: string;
      progressClass: string;
      borderClass: string;
      badgeClass: string;
    }
  > = {
    calories: {
      title: 'Calorias',
      icon: Flame,
      colorClass: 'text-amber-600',
      bgClass: 'bg-amber-500/10',
      progressClass: isExceeded ? 'bg-rose-500' : 'bg-amber-500',
      borderClass: 'border-amber-200/80',
      badgeClass: 'bg-amber-100 text-amber-800',
    },
    protein: {
      title: 'Proteína',
      icon: Beef,
      colorClass: 'text-emerald-600',
      bgClass: 'bg-emerald-500/10',
      progressClass: 'bg-emerald-500',
      borderClass: 'border-emerald-200/80',
      badgeClass: 'bg-emerald-100 text-emerald-800',
    },
    carbs: {
      title: 'Carboidratos',
      icon: Wheat,
      colorClass: 'text-blue-600',
      bgClass: 'bg-blue-500/10',
      progressClass: 'bg-blue-500',
      borderClass: 'border-blue-200/80',
      badgeClass: 'bg-blue-100 text-blue-800',
    },
    fat: {
      title: 'Gorduras',
      icon: Droplet,
      colorClass: 'text-purple-600',
      bgClass: 'bg-purple-500/10',
      progressClass: 'bg-purple-500',
      borderClass: 'border-purple-200/80',
      badgeClass: 'bg-purple-100 text-purple-800',
    },
  };

  const config = configs[type];
  const Icon = config.icon;
  const isCalories = type === 'calories';
  const displayUnit = isCalories ? 'kcal' : unit;

  // Clean rounding avoiding JS floating point representation quirks (e.g., 30.400000000000006)
  const safeConsumed = Math.round(consumed * 10) / 10;
  const safeRemaining = Math.round(Math.abs(remaining) * 10) / 10;
  const effectiveTarget = isCalories && adjustedTarget ? adjustedTarget : target;

  return (
    <div
      id={`macro-card-${type}`}
      className={`relative p-4 rounded-2xl bg-white border ${config.borderClass} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${config.bgClass} ${config.colorClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {config.title}
            </span>
          </div>

          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              isExceeded ? 'bg-rose-100 text-rose-700' : config.badgeClass
            }`}
          >
            {percent}%
          </span>
        </div>

        {/* Big numbers */}
        <div className="mt-2 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {safeConsumed.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              / {effectiveTarget.toLocaleString('pt-BR')} {displayUnit}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Subtext */}
      <div className="mt-3.5 space-y-1.5">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${config.progressClass}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">
            {isCalories
              ? isExceeded
                ? `Excedeu ${safeRemaining.toLocaleString('pt-BR')} kcal`
                : `Restam ${safeRemaining.toLocaleString('pt-BR')} kcal`
              : isExceeded
              ? `Meta atingida (+${safeRemaining}g)`
              : `Faltam ${safeRemaining}g`}
          </span>

          <span className="font-medium text-[10px] text-slate-400">
            {isCalories ? (
              activeBurnBonus && activeBurnBonus > 0 ? (
                <span className="text-amber-600 font-bold">
                  +{activeBurnBonus} kcal treino
                </span>
              ) : (
                `Alvo: ${target.toLocaleString('pt-BR')} kcal`
              )
            ) : (
              `Alvo: ${target}g`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
