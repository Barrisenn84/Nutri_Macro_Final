// NutriMacro Service Worker - Background Meal Reminders & Notification API Scheduler
const SW_VERSION = 'nutrimacro-sw-v2.0.0';

// Install event - immediately take control
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim all connected clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      console.log(`[ServiceWorker] NutriMacro scheduler active (${SW_VERSION})`);
    })
  );
});

// Stored schedules and configuration
let backgroundReminders = [];
let backgroundSettings = {
  enabled: true,
  sound: true,
  smartSkipIfLogged: true,
  browserNotifications: true,
};
let notifiedTodayMap = new Map(); // key: "YYYY-MM-DD_reminderId" -> boolean

// Background check interval running inside Service Worker
let schedulerIntervalId = null;

function checkScheduledMealReminders() {
  if (!backgroundSettings.enabled) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${hours}:${minutes}`;

  for (const reminder of backgroundReminders) {
    if (!reminder.enabled) continue;

    if (reminder.time === currentTimeStr) {
      const key = `${todayStr}_${reminder.id}`;
      if (notifiedTodayMap.get(key)) {
        continue;
      }

      // Mark as notified for today
      notifiedTodayMap.set(key, true);

      // Trigger system notification
      const mealType = reminder.mealType || 'lunch';
      const title = `🔔 ${reminder.label} — NutriMacro`;
      const body = reminder.message || 'Hora de registrar seu prato e acompanhar seus macros diários!';

      self.registration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `meal_reminder_${reminder.id}_${todayStr}`,
        renotify: true,
        requireInteraction: false,
        vibrate: [300, 150, 300, 150, 450],
        data: {
          url: `/?action=log_meal&type=${mealType}`,
          mealType,
          reminderId: reminder.id,
          timestamp: Date.now(),
        },
        actions: [
          {
            action: 'log_meal',
            title: '🍽️ Registrar Agora',
          },
          {
            action: 'view_diary',
            title: '📅 Ver Diário',
          },
          {
            action: 'snooze_15',
            title: '⏰ Lembrar em 15m',
          },
        ],
      });
    }
  }
}

// Start persistent scheduler loop (every 25 seconds)
function ensureSchedulerRunning() {
  if (!schedulerIntervalId) {
    schedulerIntervalId = setInterval(checkScheduledMealReminders, 25000);
  }
}
ensureSchedulerRunning();

// Handle incoming Web Push events from PushManager / Push Server
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '🔔 NutriMacro: Hora da Refeição!';
  const mealType = data.mealType || 'lunch';
  const body = data.body || 'Hora de registrar sua refeição e manter seus macros no alvo diário!';
  const icon = data.icon || '/icon-192.png';
  const tag = data.tag || `meal_push_${mealType}_${Date.now()}`;

  const options = {
    body,
    icon,
    badge: icon,
    tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [300, 150, 300, 150, 450],
    data: {
      url: `/?action=log_meal&type=${mealType}`,
      mealType,
      timestamp: Date.now(),
      ...data,
    },
    actions: [
      {
        action: 'log_meal',
        title: '🍽️ Registrar Agora',
      },
      {
        action: 'view_diary',
        title: '📅 Ver Diário',
      },
      {
        action: 'snooze_15',
        title: '⏰ Lembrar em 15m',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click: focus app window or open url with meal action
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};
  const mealType = notifData.mealType || 'lunch';

  // Snooze action in background
  if (action === 'snooze_15') {
    setTimeout(() => {
      self.registration.showNotification(`🔔 Lembrete Adiado: ${mealType.toUpperCase()} — NutriMacro`, {
        body: 'Passaram-se 15 minutos. Que tal registrar sua refeição agora?',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `snooze_${mealType}_${Date.now()}`,
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
          url: `/?action=log_meal&type=${mealType}`,
          mealType,
        },
        actions: [
          { action: 'log_meal', title: '🍽️ Registrar' },
          { action: 'view_diary', title: '📅 Ver Diário' },
        ],
      });
    }, 15 * 60 * 1000);
    return;
  }

  let targetUrl = notifData.url || `/?action=log_meal&type=${mealType}`;
  if (action === 'view_diary') {
    targetUrl = '/?action=view_diary';
  } else if (action === 'log_meal') {
    targetUrl = `/?action=log_meal&type=${mealType}`;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window client is already open, focus it and broadcast event
      for (const client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            action: action || 'open',
            mealType,
            data: notifData,
          });
          return;
        }
      }

      // If no window is currently open, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle messages from the client (e.g. Schedule reminders, Trigger instant test)
self.addEventListener('message', (event) => {
  const { data } = event;
  if (!data) return;

  if (data.type === 'TRIGGER_NOTIFICATION') {
    const { title, options } = data;
    self.registration.showNotification(title || '🔔 NutriMacro', {
      body: options?.body || 'Lembrete de refeição agendada.',
      icon: options?.icon || '/icon-192.png',
      badge: options?.icon || '/icon-192.png',
      vibrate: [300, 150, 300, 150, 450],
      tag: options?.tag || `nutrimacro_msg_${Date.now()}`,
      renotify: true,
      requireInteraction: false,
      data: options?.data || { url: '/' },
      actions: [
        { action: 'log_meal', title: '🍽️ Registrar' },
        { action: 'view_diary', title: '📅 Ver Diário' },
      ],
    });
  }

  if (data.type === 'SCHEDULE_DELAYED_TEST') {
    const { delayMs, title, options } = data;
    setTimeout(() => {
      self.registration.showNotification(title || '🔔 Alerta em Segundo Plano — NutriMacro', {
        body: options?.body || 'Excelente! A notificação funcionou com sucesso.',
        icon: options?.icon || '/icon-192.png',
        badge: options?.icon || '/icon-192.png',
        vibrate: [300, 150, 300, 150, 450],
        tag: options?.tag || `test_bg_${Date.now()}`,
        renotify: true,
        data: options?.data || { url: '/?action=log_meal&type=lunch', mealType: 'lunch' },
        actions: [
          { action: 'log_meal', title: '🍽️ Registrar' },
          { action: 'view_diary', title: '📅 Ver Diário' },
        ],
      });
    }, delayMs || 4000);
  }

  if (data.type === 'SCHEDULE_REMINDERS') {
    const { reminders, settings } = data;
    backgroundReminders = Array.isArray(reminders) ? reminders : [];
    if (settings) backgroundSettings = settings;
    ensureSchedulerRunning();
    console.log('[ServiceWorker] Updated background meal schedules:', backgroundReminders.length);
  }
});
