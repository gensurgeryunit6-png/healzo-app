import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let configured = false;
function configure() {
  if (configured || Platform.OS === 'web') return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('timer', {
      name: 'Screen-time timer',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {});
  }
}

async function allowed() {
  if (Platform.OS === 'web') return false;
  configure();
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

const KEY_IDS: string[] = [];

/** Schedule "5 minutes left" and "time's up" reminders for a running timer. */
export async function scheduleTimerAlerts(minutesLeft: number, name: string) {
  await cancelTimerAlerts();
  if (minutesLeft <= 0) return;
  if (!(await allowed())) return;
  const mk = (seconds: number, title: string, body: string) =>
    Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(5, Math.round(seconds)), channelId: 'timer' } as any,
    });
  try {
    if (minutesLeft > 6) KEY_IDS.push(await mk((minutesLeft - 5) * 60, '5 minutes left ⏳', `${name}, start wrapping up your screen time.`));
    KEY_IDS.push(await mk(minutesLeft * 60, 'Screen time is up! 🌱', 'Great job — time for something screen-free. Check Healzo for ideas!'));
  } catch {}
}

export async function cancelTimerAlerts() {
  if (Platform.OS === 'web') return;
  while (KEY_IDS.length) {
    const id = KEY_IDS.pop()!;
    await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  }
}
