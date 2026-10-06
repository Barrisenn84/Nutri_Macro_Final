import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Apple,
  Droplets,
  Volume2,
  VolumeX,
  CheckCircle2,
  AlertCircle,
  Play,
  Clock,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Radio,
  ExternalLink,
  Timer,
  Zap,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MealReminderConfig, MealType } from '../../types';
import { LocalNotificationService } from '../../services/LocalNotificationService';

export const NotificationSettingsCard: React.FC = () => {
  const {
    notificationSettings,
    updateNotificationSettings,
    requestNotificationPermission,
    testNotification,
    testDelayedBackgroundNotification,
    isServiceWorkerActive,
    showToast,
  } = useApp();

  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [delayedCountdown, setDelayedCountdown] = useState<number | null>(null);

  // Live timer for upcoming reminder calculation
  const [nextReminderInfo, setNextReminderInfo] = useState<{
    label: string;
    time: string;
    timeRemainingFormatted: string;
    isToday: boolean;
  }>({
    label: 'Calculando...',
    time: '--:--',
    timeRemainingFormatted: '',
    isToday: true,
  });

  const updateUpcomingInfo = () => {
    const info = LocalNotificationService.calculateNextScheduledReminder(notificationSettings);
    setNextReminderInfo(info);
  };

  useEffect(() => {
    setPermission(LocalNotificationService.getPermissionStatus());
    updateUpcomingInfo();

    const interval = setInterval(updateUpcomingInfo, 30000);
    return () => clearInterval(interval);
  }, [notificationSettings]);

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    const res = await requestNotificationPermission();
    setPermission(res);
    setIsRequestingPermission(false);
    if (res === 'granted') {
      showToast('Notification API autorizada! Você receberá alertas mesmo com o app fora de foco.');
    } else if (res === 'denied') {
      showToast('Notificações bloqueadas no navegador. Os alertas serão exibidos no app.');
    }
  };

  const handleDelayedBackgroundTest = () => {
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }

    setDelayedCountdown(4);
    testDelayedBackgroundNotification(4);

    let count = 4;
    const interval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(interval);
        setDelayedCountdown(null);
      } else {
        setDelayedCountdown(count);
      }
    }, 1000);
  };

  const handleToggleGlobal = (enabled: boolean) => {
    updateNotificationSettings({ enabled });
    showToast(enabled ? 'Lembretes de refeição ativados!' : 'Lembretes de refeição desativados.');
  };

  const handleToggleSound = (sound: boolean) => {
    updateNotificationSettings({ sound });
    showToast(sound ? 'Som de lembretes ativado!' : 'Som de lembretes silenciado.');
  };

  const handleToggleSmartSkip = (smartSkipIfLogged: boolean) => {
    updateNotificationSettings({ smartSkipIfLogged });
    showToast(
      smartSkipIfLogged
        ? 'Modo inteligente ativo: refeições já registradas não serão cobradas.'
        : 'Lembretes serão enviados mesmo se já registrado.'
    );
  };

  const handleUpdateReminder = (
    key: string,
    updates: Partial<MealReminderConfig>
  ) => {
    const current = notificationSettings.reminders[key] || {
      id: key,
      mealType: (key.includes('snack') ? 'snack' : key) as MealType,
      label: key,
      time: '12:00',
      enabled: true,
      message: 'Hora da refeição!',
    };

    updateNotificationSettings({
      reminders: {
        ...notificationSettings.reminders,
        [key]: {
          ...current,
          ...updates,
        },
      },
    });
  };

  // AI-Assisted Strategic Meal Timing Calibration (4 protein pulses spaced 3h30 to 4h apart)
  const handleApplyStrategicTiming = (wakeUpTimeStr: string = '07:30') => {
    const [wH, wM] = wakeUpTimeStr.split(':').map(Number);
    const addMinutes = (baseH: number, baseM: number, addedMin: number) => {
      const totalM = (baseH * 60 + baseM + addedMin) % (24 * 60);
      const h = String(Math.floor(totalM / 60)).padStart(2, '0');
      const m = String(totalM % 60).padStart(2, '0');
      return `${h}:${m}`;
    };

    const newBreakfast = addMinutes(wH, wM, 30); // 30 min after wake
    const newMorningSnack = addMinutes(wH, wM, 210); // 3h30 after wake
    const newLunch = addMinutes(wH, wM, 330); // 5h30 after wake
    const newAfternoonSnack = addMinutes(wH, wM, 540); // 9h after wake
    const newDinner = addMinutes(wH, wM, 750); // 12h30 after wake
    const newSupper = addMinutes(wH, wM, 900); // 15h after wake

    updateNotificationSettings({
      reminders: {
        ...notificationSettings.reminders,
        breakfast: {
          ...(notificationSettings.reminders.breakfast || {
            id: 'breakfast',
            mealType: 'breakfast',
            label: 'Café da Manhã',
            enabled: true,
            message: 'Hora do café da manhã!',
          }),
          time: newBreakfast,
          enabled: true,
        },
        morning_snack: {
          ...(notificationSettings.reminders.morning_snack || {
            id: 'morning_snack',
            mealType: 'snack',
            label: 'Lanche da Manhã (Colação)',
            enabled: true,
            message: 'Hora da colação!',
          }),
          time: newMorningSnack,
          enabled: true,
        },
        lunch: {
          ...(notificationSettings.reminders.lunch || {
            id: 'lunch',
            mealType: 'lunch',
            label: 'Almoço',
            enabled: true,
            message: 'Hora do almoço!',
          }),
          time: newLunch,
          enabled: true,
        },
        snack: {
          ...(notificationSettings.reminders.snack || {
            id: 'snack',
            mealType: 'snack',
            label: 'Lanche da Tarde',
            enabled: true,
            message: 'Hora do lanche da tarde!',
          }),
          time: newAfternoonSnack,
          enabled: true,
        },
        dinner: {
          ...(notificationSettings.reminders.dinner || {
            id: 'dinner',
            mealType: 'dinner',
            label: 'Jantar',
            enabled: true,
            message: 'Hora do jantar!',
          }),
          time: newDinner,
          enabled: true,
        },
        supper: {
          ...(notificationSettings.reminders.supper || {
            id: 'supper',
            mealType: 'supper',
            label: 'Ceia Noturna',
            enabled: true,
            message: 'Hora da ceia!',
          }),
          time: newSupper,
          enabled: true,
        },
      },
    });

    showToast('Horários estratégicos de refeição sincronizados com sucesso!');
  };

  const handleTestSpecificMeal = (mealKey: string, label: string) => {
    const config = notificationSettings.reminders[mealKey];
    if (!config) return;

    if (permission === 'granted') {
      LocalNotificationService.sendSystemNotification(`🔔 Lembrete: ${label} — NutriMacro`, {
        body: config.message,
        tag: `test_${mealKey}_${Date.now()}`,
        mealType: config.mealType,
      });
    }

    testNotification();
    showToast(`Disparado alerta de teste para "${label}"!`);
  };

  const strategicMoments: Array<{
    key: string;
    label: string;
    icon: React.ReactNode;
    colorClasses: {
      bg: string;
      text: string;
      border: string;
      badge: string;
    };
    description: string;
  }> = [
    {
      key: 'breakfast',
      label: 'Café da Manhã (Desjejum)',
      icon: <Coffee className="w-5 h-5 text-amber-500" />,
      colorClasses: {
        bg: 'bg-amber-50/70',
        text: 'text-amber-950',
        border: 'border-amber-200/80',
        badge: 'bg-amber-100 text-amber-800',
      },
      description: 'Abertura do dia com reposição de glicogênio e primeiro pulso proteico.',
    },
    {
      key: 'morning_snack',
      label: 'Lanche da Manhã (Colação)',
      icon: <Apple className="w-5 h-5 text-rose-500" />,
      colorClasses: {
        bg: 'bg-rose-50/70',
        text: 'text-rose-950',
        border: 'border-rose-200/80',
        badge: 'bg-rose-100 text-rose-800',
      },
      description: 'Estabilização da glicemia e saciedade até o almoço.',
    },
    {
      key: 'lunch',
      label: 'Almoço Principal',
      icon: <Sun className="w-5 h-5 text-emerald-500" />,
      colorClasses: {
        bg: 'bg-emerald-50/70',
        text: 'text-emerald-950',
        border: 'border-emerald-200/80',
        badge: 'bg-emerald-100 text-emerald-800',
      },
      description: 'Principal refeição do dia com aporte denso de carboidratos complexos e proteínas.',
    },
    {
      key: 'snack',
      label: 'Lanche da Tarde (Pré/Pós Treino)',
      icon: <Cookie className="w-5 h-5 text-orange-500" />,
      colorClasses: {
        bg: 'bg-orange-50/70',
        text: 'text-orange-950',
        border: 'border-orange-200/80',
        badge: 'bg-orange-100 text-orange-800',
      },
      description: 'Suporte energético para o treino e síntese proteica intermediária.',
    },
    {
      key: 'dinner',
      label: 'Jantar',
      icon: <Moon className="w-5 h-5 text-indigo-500" />,
      colorClasses: {
        bg: 'bg-indigo-50/70',
        text: 'text-indigo-950',
        border: 'border-indigo-200/80',
        badge: 'bg-indigo-100 text-indigo-800',
      },
      description: 'Fechamento calórico e recuperação muscular noturna.',
    },
    {
      key: 'supper',
      label: 'Ceia Noturna',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      colorClasses: {
        bg: 'bg-purple-50/70',
        text: 'text-purple-950',
        border: 'border-purple-200/80',
        badge: 'bg-purple-100 text-purple-800',
      },
      description: 'Opção leve de digestão lenta (ex: caseína, queijo branco, ovos) antes de dormir.',
    },
    {
      key: 'water',
      label: 'Lembrete de Hidratação',
      icon: <Droplets className="w-5 h-5 text-cyan-500" />,
      colorClasses: {
        bg: 'bg-cyan-50/70',
        text: 'text-cyan-950',
        border: 'border-cyan-200/80',
        badge: 'bg-cyan-100 text-cyan-800',
      },
      description: 'Alerta programado para beber água e manter a osmorregulação ideal.',
    },
  ];

  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-6">
      {/* Header with Title and Global Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Agendamento de Lembretes & Notification API
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                Service Worker Ativo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Notificações push nativas nos momentos estratégicos do dia, mesmo com o navegador em segundo plano ou aba fechada.
            </p>
          </div>
        </div>

        {/* Global Master Switch */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-50 p-2 rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700">
            {notificationSettings.enabled ? 'Ativo' : 'Desativado'}
          </span>
          <button
            type="button"
            id="btn-toggle-global-notifications"
            onClick={() => handleToggleGlobal(!notificationSettings.enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              notificationSettings.enabled ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                notificationSettings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Live Upcoming Notification Countdown Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white shadow-md border border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider block">
              Próximo Lembrete Programado
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-bold text-white">{nextReminderInfo.label}</span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                às {nextReminderInfo.time} ({nextReminderInfo.timeRemainingFormatted})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDelayedBackgroundTest}
            disabled={delayedCountdown !== null}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            {delayedCountdown !== null ? (
              <span>Disparando em {delayedCountdown}s...</span>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5" />
                <span>Testar Fora de Foco (4s)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Push API & Browser Permission Status */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {permission === 'granted' ? (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          ) : permission === 'denied' ? (
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800">
                Notification API do Navegador:
              </span>
              {permission === 'granted' && (
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Autorizada (Alertas em Segundo Plano Ativos)
                </span>
              )}
              {permission === 'denied' && (
                <span className="text-xs font-semibold text-rose-700">
                  Bloqueada pelo Navegador (Permita nas configurações do site)
                </span>
              )}
              {permission === 'default' && (
                <span className="text-xs font-semibold text-amber-700">
                  Permissão Pendente de Autorização
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {permission === 'granted'
                ? 'O Service Worker está autorizado a disparar alertas com vibração e botões de ação.'
                : 'Clique no botão ao lado para autorizar o envio de notificações nativas na tela.'}
            </p>
          </div>
        </div>

        {permission !== 'granted' && (
          <button
            onClick={handleRequestPermission}
            disabled={isRequestingPermission}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md transition-all self-start md:self-auto"
          >
            {isRequestingPermission ? 'Solicitando...' : 'Autorizar Notificações'}
          </button>
        )}
      </div>

      {/* Global Controls & Smart Strategy Tuning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Sound Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-2xs">
              {notificationSettings.sound ? (
                <Volume2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Sons de Alerta</span>
              <span className="text-[11px] text-slate-500">
                Sinal sonoro suave ao disparar o lembrete
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggleSound(!notificationSettings.sound)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              notificationSettings.sound ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                notificationSettings.sound ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Smart Skip toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 block">Modo Inteligente (Smart Skip)</span>
              <span className="text-[11px] text-slate-500">
                Não incomodar se a refeição já foi registrada hoje
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleToggleSmartSkip(!notificationSettings.smartSkipIfLogged)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              notificationSettings.smartSkipIfLogged ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                notificationSettings.smartSkipIfLogged ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Strategic Meal Timing Presets */}
      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Calibração Estratégica Automática (Pulsos Proteicos a cada 3h30)</span>
            </h4>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Distribui os horários de forma cientificamente ótima para manter a síntese proteica (MPS) elevada ao longo do dia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApplyStrategicTiming('07:00')}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
            >
              Acordo às 07:00
            </button>
            <button
              onClick={() => handleApplyStrategicTiming('08:00')}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-[11px] cursor-pointer shadow-2xs transition-colors"
            >
              Acordo às 08:00
            </button>
          </div>
        </div>
      </div>

      {/* Scheduled Meal Moments Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span>Horários das Refeições Programadas no Dia</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {strategicMoments.map((meal) => {
            const config = notificationSettings.reminders[meal.key] || {
              id: meal.key,
              mealType: 'lunch',
              label: meal.label,
              time: '12:00',
              enabled: false,
              message: 'Lembrete de refeição.',
            };

            return (
              <div
                key={meal.key}
                className={`p-4 rounded-2xl border transition-all ${meal.colorClasses.bg} ${meal.colorClasses.border} flex flex-col justify-between gap-3`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200/60">
                      {meal.icon}
                    </div>
                    <div>
                      <h5 className={`text-xs font-bold ${meal.colorClasses.text}`}>
                        {meal.label}
                      </h5>
                      <span className="text-[10px] text-slate-500 block">
                        {meal.description}
                      </span>
                    </div>
                  </div>

                  {/* Individual Switch */}
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateReminder(meal.key, { enabled: !config.enabled })
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      config.enabled && notificationSettings.enabled
                        ? 'bg-emerald-600'
                        : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        config.enabled && notificationSettings.enabled
                          ? 'translate-x-4'
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Time Picker & Test Action */}
                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-600">Horário:</span>
                    <input
                      type="time"
                      value={config.time}
                      onChange={(e) =>
                        handleUpdateReminder(meal.key, { time: e.target.value })
                      }
                      disabled={!config.enabled || !notificationSettings.enabled}
                      className="px-2.5 py-1 bg-white rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-800 shadow-2xs focus:border-emerald-500 outline-hidden disabled:opacity-50 cursor-pointer ml-1"
                    />
                  </div>

                  <button
                    onClick={() => handleTestSpecificMeal(meal.key, meal.label)}
                    className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-700 hover:text-emerald-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title={`Disparar teste imediato para ${meal.label}`}
                  >
                    <Send className="w-3 h-3" />
                    <span>Testar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
