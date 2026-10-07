import React, { useState } from 'react';
import {
  X,
  Watch,
  Activity,
  Flame,
  Heart,
  Footprints,
  Clock,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Droplet,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Crown,
  Mic,
  BatteryCharging,
  Radio,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SmartwatchProvider, SmartwatchCalorieStrategy } from '../../types';

interface SmartwatchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartwatchSyncModal: React.FC<SmartwatchSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    smartwatchData,
    smartwatchConfig,
    updateSmartwatchConfig,
    selectSmartwatchModel,
    syncSmartwatchData,
    isSyncingSmartwatch,
    smartwatchAdvice,
    fetchSmartwatchWorkoutAdvice,
    isLoadingAdvice,
    addWaterIntake,
    dailyGoalProgress,
    targets,
    showToast,
    isMasterAdmin,
    setVoiceAssistantOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'status' | 'watch_face' | 'settings'>('status');

  if (!isOpen) return null;

  const providers: Array<{
    id: SmartwatchProvider;
    name: string;
    description: string;
    icon: string;
  }> = [
    {
      id: 'health_connect',
      name: 'Samsung Galaxy Watch & Health Connect',
      description: 'Galaxy Watch Ultra, 7, 6, 5 e Wear OS da Samsung/Google',
      icon: '⌚',
    },
    {
      id: 'apple_health',
      name: 'Apple Watch & HealthKit',
      description: 'Apple Watch Ultra 2, Series 10, 9 e SE via Apple Saúde',
      icon: '🍏',
    },
    {
      id: 'garmin',
      name: 'Garmin Connect & GPS',
      description: 'Fenix 8, Forerunner 965 e relógios de performance',
      icon: '🏃',
    },
    {
      id: 'wear_os',
      name: 'Google Wear OS (Pixel & Xiaomi)',
      description: 'Pixel Watch 3, TicWatch Pro 5 e Xiaomi Watch 2',
      icon: '🤖',
    },
    {
      id: 'amazfit',
      name: 'Amazfit & Zepp OS',
      description: 'Amazfit Balance, T-Rex Ultra e Cheetah Pro',
      icon: '⚡',
    },
  ];

  const wearableModels = [
    {
      id: 'galaxy_watch_ultra',
      name: 'Samsung Galaxy Watch Ultra',
      tag: 'Titanium & Botão Laranja',
      provider: 'health_connect' as SmartwatchProvider,
      icon: '⌚',
      isFounderChoice: true,
    },
    {
      id: 'galaxy_watch_7',
      name: 'Samsung Galaxy Watch 7',
      tag: 'BioActive Sensor 3nm',
      provider: 'health_connect' as SmartwatchProvider,
      icon: '⌚',
    },
    {
      id: 'galaxy_watch_6',
      name: 'Samsung Galaxy Watch 6 Classic',
      tag: 'Coroa Giratória Física',
      provider: 'health_connect' as SmartwatchProvider,
      icon: '⌚',
    },
    {
      id: 'apple_watch_ultra_2',
      name: 'Apple Watch Ultra 2',
      tag: 'Titanium 49mm & Action Button',
      provider: 'apple_health' as SmartwatchProvider,
      icon: '🍏',
    },
    {
      id: 'apple_watch_s10',
      name: 'Apple Watch Series 10',
      tag: 'Design Fino & Tela OLED Ampla',
      provider: 'apple_health' as SmartwatchProvider,
      icon: '🍏',
    },
    {
      id: 'garmin_fenix_8',
      name: 'Garmin Fenix 8',
      tag: 'Endurance Multiesportivo',
      provider: 'garmin' as SmartwatchProvider,
      icon: '🏃',
    },
    {
      id: 'pixel_watch_3',
      name: 'Google Pixel Watch 3',
      tag: 'Wear OS 5 & Actua Display',
      provider: 'wear_os' as SmartwatchProvider,
      icon: '🤖',
    },
    {
      id: 'amazfit_balance',
      name: 'Amazfit Balance (Zepp OS)',
      tag: 'Bateria de 14 dias & BIA',
      provider: 'amazfit' as SmartwatchProvider,
      icon: '⚡',
    },
  ];

  const handleModelSelect = async (modelId: string, provider: SmartwatchProvider) => {
    await selectSmartwatchModel(modelId, provider);
  };

  const handleProviderSelect = (provider: SmartwatchProvider) => {
    updateSmartwatchConfig({ provider });
    showToast(`Provedor alterado para ${provider.replace('_', ' ').toUpperCase()}`);
  };

  const handleStrategyChange = (calorieStrategy: SmartwatchCalorieStrategy) => {
    updateSmartwatchConfig({ calorieStrategy });
    showToast('Estratégia calórica de treino atualizada com sucesso!');
  };

  const handleQuickWaterFromWatch = () => {
    addWaterIntake(250);
    showToast('⌚ +250ml registrados com 1 toque no relógio!');
  };

  const handleVoiceFromWatch = () => {
    setVoiceAssistantOpen(true);
    showToast('🎤 Microfone do relógio ativado! Fale sua refeição para a IA Gemini.');
  };

  const isGalaxyWatch =
    smartwatchData.deviceName.toLowerCase().includes('galaxy') ||
    smartwatchConfig.provider === 'health_connect' ||
    smartwatchConfig.provider === 'samsung_health';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Watch className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Integração de Relógio Inteligente & Wearables
            </span>
            {isMasterAdmin && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Acesso Master Fundador</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Smartwatch & Health Sync</span>
            {smartwatchData?.connected && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Conectado
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Conecte seu Galaxy Watch Ultra, Apple Watch ou Garmin para sincronizar calorias ativas, passos e batimentos cardíacos.
          </p>

          {/* Sub Nav Tabs */}
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'status'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Telemetria do Pulso</span>
            </button>

            <button
              onClick={() => setActiveTab('watch_face')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'watch_face'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Watch className="w-3.5 h-3.5" />
              <span>Visor do Relógio (Widget)</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Estratégia Calórica</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* TAB 1: TELEMETRIA DO PULSO */}
          {activeTab === 'status' && (
            <div className="space-y-5">
              {/* Device Selector with Quick Model Pills */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Escolha seu Relógio Conectado
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Ativo: <strong className="text-indigo-600">{smartwatchData.deviceName}</strong>
                  </span>
                </div>

                {/* Model Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {wearableModels.map((m) => {
                    const isCurrent =
                      smartwatchData.deviceName.toLowerCase().includes(m.name.toLowerCase().split(' ')[1] || '---') ||
                      smartwatchConfig.deviceModel === m.id ||
                      (m.id === 'galaxy_watch_ultra' && smartwatchData.deviceName.includes('Ultra') && isGalaxyWatch);

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleModelSelect(m.id, m.provider)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                          isCurrent
                            ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{m.icon}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-900 truncate">{m.name}</span>
                              {m.isFounderChoice && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-500/20 text-amber-800 border border-amber-300">
                                  Top Escolha
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate">{m.tag}</span>
                          </div>
                        </div>

                        {isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Telemetry Metrics Grid */}
              <div className="p-5 rounded-3xl bg-slate-950 text-white space-y-4 shadow-lg border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-wider text-indigo-400 font-extrabold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{smartwatchData.deviceName}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      <BatteryCharging className="w-3 h-3 text-emerald-400" />
                      <span>{smartwatchData.batteryLevelPercent ?? 90}%</span>
                    </span>
                    {smartwatchData.vo2Max && (
                      <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800 px-2 py-0.5 rounded-full">
                        VO2 Max: {smartwatchData.vo2Max}
                      </span>
                    )}
                    {smartwatchData.bodyFatPercentEstimated && (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                        BIA: {smartwatchData.bodyFatPercentEstimated}% Gordura
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={syncSmartwatchData}
                      disabled={isSyncingSmartwatch}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSmartwatch ? 'animate-spin' : ''}`} />
                      <span>{isSyncingSmartwatch ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  {/* Active Burn */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                      <Flame className="w-4 h-4 shrink-0" />
                      <span>Gasto Ativo</span>
                    </div>
                    <p className="text-xl font-black text-white tracking-tight">
                      {smartwatchData.caloriesBurnedActive} <span className="text-xs font-normal text-slate-400">kcal</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Queimadas em treino</p>
                  </div>

                  {/* Steps */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                      <Footprints className="w-4 h-4 shrink-0" />
                      <span>Passos Hoje</span>
                    </div>
                    <p className="text-xl font-black text-white tracking-tight">
                      {smartwatchData.stepsCount.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[10px] text-slate-400">Atividade diária</p>
                  </div>

                  {/* Heart Rate */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-rose-300 text-xs font-bold">
                      <Heart className="w-4 h-4 shrink-0 animate-pulse text-rose-500" />
                      <span>BPM Médio</span>
                    </div>
                    <p className="text-xl font-black text-white tracking-tight">
                      {smartwatchData.heartRateAvg} <span className="text-xs font-normal text-slate-400">bpm</span>
                    </p>
                    <p className="text-[10px] text-slate-400">Frequência no treino</p>
                  </div>

                  {/* Active Time */}
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Tempo Ativo</span>
                    </div>
                    <p className="text-xl font-black text-white tracking-tight">
                      {smartwatchData.activeMinutes} <span className="text-xs font-normal text-slate-400">min</span>
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{smartwatchData.workoutType || 'Musculação'}</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 border-t border-white/10 pt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span>
                    Último treino detectado: <strong className="text-white">{smartwatchData.workoutType}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVoiceFromWatch}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-colors cursor-pointer border border-white/15"
                    >
                      <Mic className="w-3 h-3 text-indigo-400" />
                      <span>Comando de Voz no Relógio</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Workout & Nutrition Advice Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white border border-emerald-500/30 space-y-4 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">Orientação Pós-Treino com IA Gemini</h3>
                      <p className="text-[11px] text-emerald-300/80">
                        Baseado no gasto real de {smartwatchData.caloriesBurnedActive} kcal registrado pelo {smartwatchData.deviceName}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={fetchSmartwatchWorkoutAdvice}
                    disabled={isLoadingAdvice}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50 self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isLoadingAdvice ? 'Consultando IA...' : 'Gerar Pós-Treino Ideal'}</span>
                  </button>
                </div>

                {smartwatchAdvice ? (
                  <div className="space-y-3 pt-2 text-xs">
                    <p className="text-slate-200 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
                      {smartwatchAdvice.summary}
                    </p>

                    <div className="p-4 rounded-2xl bg-emerald-900/30 border border-emerald-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-emerald-300 text-xs uppercase tracking-wider">
                          Prescrição do Prato / Lanche Pós-Treino:
                        </span>
                        <span className="text-[10px] text-slate-300 bg-black/40 px-2 py-0.5 rounded-full">
                          Janela: {smartwatchAdvice.recommendedPostWorkoutSnack.optimalTimingMinutes} min
                        </span>
                      </div>
                      <p className="font-bold text-white text-sm">
                        {smartwatchAdvice.recommendedPostWorkoutSnack.title}
                      </p>
                      <p className="text-slate-300 text-xs">
                        {smartwatchAdvice.recommendedPostWorkoutSnack.description}
                      </p>

                      <div className="grid grid-cols-4 gap-2 pt-1 text-center font-bold">
                        <div className="p-1.5 rounded-xl bg-black/30">
                          <p className="text-[10px] text-slate-400">Calorias</p>
                          <p className="text-white text-xs">{smartwatchAdvice.recommendedPostWorkoutSnack.calories} kcal</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-black/30">
                          <p className="text-[10px] text-rose-400">Proteína</p>
                          <p className="text-white text-xs">{smartwatchAdvice.recommendedPostWorkoutSnack.proteinG}g</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-black/30">
                          <p className="text-[10px] text-amber-400">Carbos</p>
                          <p className="text-white text-xs">{smartwatchAdvice.recommendedPostWorkoutSnack.carbsG}g</p>
                        </div>
                        <div className="p-1.5 rounded-xl bg-black/30">
                          <p className="text-[10px] text-emerald-400">Gordura</p>
                          <p className="text-white text-xs">{smartwatchAdvice.recommendedPostWorkoutSnack.fatG}g</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <p className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">
                        Recomendações Clínicas de Recuperação:
                      </p>
                      <ul className="space-y-1 text-slate-300">
                        {smartwatchAdvice.recoveryTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-white/5 p-3 rounded-2xl border border-white/5">
                    Clique em &quot;Gerar Pós-Treino Ideal&quot; para a inteligência artificial analisar a telemetria do seu exercício e sugerir a refeição ideal de reposição energética.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SIMULADOR DE VISOR DO RELÓGIO (COMPLICATION) */}
          {activeTab === 'watch_face' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  O NutriMacro espelha dados em tempo real para os mostradores do <strong>{smartwatchData.deviceName}</strong>. Você pode acompanhar as metas de calorias e bater água ou registrar refeição direto pelo pulso.
                </span>
              </div>

              {/* Interactive Wrist Watch Mockup (Adaptive Galaxy Watch Ultra or Apple Watch design) */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-inner">
                {/* Watch Strap Top */}
                <div className="w-32 h-6 bg-slate-800 rounded-t-xl border-t border-x border-slate-700/60" />

                {isGalaxyWatch ? (
                  /* SAMSUNG GALAXY WATCH ULTRA DESIGN (Cushion-shaped titanium case + round AMOLED display) */
                  <div className="relative flex items-center justify-center">
                    {/* Orange Quick Action Button on side */}
                    <div
                      onClick={handleVoiceFromWatch}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-12 rounded-r-lg bg-orange-600 border border-orange-400 shadow-md cursor-pointer hover:bg-orange-500 transition-colors z-10 flex items-center justify-center"
                      title="Botão de Ação Rápida Laranja do Galaxy Watch Ultra (Comando de Voz com IA)"
                    >
                      <Mic className="w-2.5 h-2.5 text-white" />
                    </div>

                    {/* Squircle Cushion Case */}
                    <div className="w-72 h-72 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-[54px] border-4 border-slate-600 p-3 shadow-2xl flex items-center justify-center relative ring-4 ring-orange-500/30">
                      {/* Circular AMOLED Display */}
                      <div className="w-56 h-56 rounded-full bg-black border-2 border-slate-700 p-4 flex flex-col justify-between text-white relative shadow-inner overflow-hidden">
                        {/* Dial Top */}
                        <div className="flex items-center justify-between text-[10px] font-mono text-orange-400">
                          <span className="font-bold flex items-center gap-1">
                            <span>GALAXY ULTRA</span>
                          </span>
                          <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Dial Center (Rings & Macros) */}
                        <div className="my-auto text-center space-y-1">
                          <div className="w-24 h-24 mx-auto rounded-full border-4 border-emerald-500 border-t-orange-500 border-r-amber-400 flex flex-col items-center justify-center shadow-lg shadow-orange-500/20">
                            <span className="text-xl font-black text-white tracking-tight">
                              {dailyGoalProgress.proteinRemaining}g
                            </span>
                            <span className="text-[9px] text-emerald-300 font-bold uppercase tracking-wider">
                              Proteína
                            </span>
                          </div>

                          <div className="text-[10px] font-semibold text-slate-300">
                            Faltam <strong className="text-white">{dailyGoalProgress.caloriesRemaining} kcal</strong>
                          </div>
                        </div>

                        {/* Dial Bottom */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px]">
                          <span className="flex items-center gap-1 text-orange-400 font-bold text-[9px]">
                            <Flame className="w-3 h-3 text-orange-500" />
                            <span>{smartwatchData.caloriesBurnedActive} kcal</span>
                          </span>

                          <button
                            type="button"
                            onClick={handleQuickWaterFromWatch}
                            className="px-2 py-0.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm text-[9px]"
                            title="Toque para registrar +250ml de água"
                          >
                            <Droplet className="w-2.5 h-2.5 text-white" />
                            <span>+250ml</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* APPLE WATCH / RECTANGULAR DESIGN */
                  <div className="w-64 h-72 bg-slate-950 rounded-[42px] border-4 border-slate-700 p-4 shadow-2xl relative flex flex-col justify-between text-white ring-8 ring-slate-900/50">
                    <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400">
                      <span className="font-bold">NUTRIMACRO</span>
                      <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="my-auto text-center space-y-2">
                      <div className="w-28 h-28 mx-auto rounded-full border-4 border-emerald-500/80 border-t-rose-500 border-r-amber-400 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="text-2xl font-black text-white tracking-tight">
                          {dailyGoalProgress.proteinRemaining}g
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                          Proteína Falta
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-300">
                        Restam <strong className="text-white">{dailyGoalProgress.caloriesRemaining} kcal</strong> hoje
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                      <span className="flex items-center gap-1 text-rose-400">
                        <Flame className="w-3 h-3" />
                        <span>{smartwatchData.caloriesBurnedActive} kcal ativo</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleQuickWaterFromWatch}
                        className="px-2.5 py-1 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Toque no relógio para registrar água"
                      >
                        <Droplet className="w-3 h-3 text-white" />
                        <span>+250ml</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Watch Strap Bottom */}
                <div className="w-32 h-6 bg-slate-800 rounded-b-xl border-b border-x border-slate-700/60" />

                <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-300">
                  <button
                    type="button"
                    onClick={handleQuickWaterFromWatch}
                    className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Droplet className="w-3.5 h-3.5 text-blue-400" />
                    <span>Testar Toque de Água (+250ml)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVoiceFromWatch}
                    className="px-3 py-1.5 rounded-xl bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 border border-orange-500/40 font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Mic className="w-3.5 h-3.5 text-orange-400" />
                    <span>Testar Voz no Relógio (IA)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESTRATÉGIA CALÓRICA & CONFIGURAÇÕES */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">Como o app deve tratar as calorias queimadas no treino?</h3>
                <p className="text-xs text-slate-500">
                  Nutricionistas esportivos recomendam estratégias diferentes de acordo com seu objetivo (Secar, Hipertrofia ou Manutenção).
                </p>

                <div className="space-y-3 pt-2">
                  {/* Option 1: Eat back half (Recommended) */}
                  <div
                    onClick={() => handleStrategyChange('eat_back_half')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      smartwatchConfig.calorieStrategy === 'eat_back_half'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">Compensar 50% do Treino</span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          Recomendado
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-700">
                        +{Math.round(smartwatchData.caloriesBurnedActive * 0.5)} kcal na meta
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Adiciona metade do gasto à sua meta calórica. Evita fome extrema e preserva sua massa muscular sem desacelerar a queima de gordura.
                    </p>
                  </div>

                  {/* Option 2: Eat back all */}
                  <div
                    onClick={() => handleStrategyChange('eat_back_all')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      smartwatchConfig.calorieStrategy === 'eat_back_all'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Compensar 100% do Treino</span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        +{smartwatchData.caloriesBurnedActive} kcal na meta
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Adiciona todo o gasto ativo ao seu orçamento calórico. Padrão ouro para quem busca <strong>hipertrofia e ganho de massa magra</strong>.
                    </p>
                  </div>

                  {/* Option 3: Maintain fixed deficit */}
                  <div
                    onClick={() => handleStrategyChange('maintain_deficit')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      smartwatchConfig.calorieStrategy === 'maintain_deficit'
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">Manter Meta Fixa (Déficit Estrito)</span>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        +0 kcal
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      As calorias queimadas não aumentam o limite de refeições. Ideal para cutting agressivo ou fase final de preparação.
                    </p>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 pt-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Preferências de Vibração e Notificação</h4>

                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Vibração háptica no pulso para horário de refeição</span>
                  <input
                    type="checkbox"
                    checked={smartwatchConfig.wristHapticReminders}
                    onChange={(e) => updateSmartwatchConfig({ wristHapticReminders: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Sincronizar registro de água do Health Connect / Samsung Health</span>
                  <input
                    type="checkbox"
                    checked={smartwatchConfig.syncWater}
                    onChange={(e) => updateSmartwatchConfig({ syncWater: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Permitir comandos de voz rápidos no microfone do relógio</span>
                  <input
                    type="checkbox"
                    checked={smartwatchConfig.voiceInputEnabled ?? true}
                    onChange={(e) => updateSmartwatchConfig({ voiceInputEnabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded-sm"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Dados de saúde protegidos e sincronizados via Health Connect</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
