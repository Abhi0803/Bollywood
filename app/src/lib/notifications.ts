// Local push notifications — a once-a-day reminder to come back and
// play. No server needed; scheduled locally on the device via
// expo-notifications.
//
// Why local-only for v1.1:
//   - Real push (server-triggered) requires APNs setup + a backend
//     scheduler. Overkill for "daily reminder to play."
//   - Local notifications work even when offline.
//   - User has full control via Settings; nothing fires without consent.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { track } from './posthog';

const DAILY_REMINDER_ID = 'naam-bolo-daily-reminder';

// Configure how notifications behave when the app is in foreground.
// Without this, foreground notifications are silently dropped on iOS.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export async function getNotificationPermission(): Promise<NotificationPermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

// Ask iOS for permission. Returns the new status. Safe to call multiple
// times — iOS only shows the system prompt once; subsequent calls just
// return the cached status.
export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (Platform.OS !== 'ios') return 'granted';
  const current = await getNotificationPermission();
  if (current !== 'undetermined') return current;
  const { status } = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowSound: true, allowBadge: false },
  });
  return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
}

// Schedule a daily reminder at the given local hour (24h, 0-23).
// Replaces any existing reminder so it's safe to call repeatedly.
export async function scheduleDailyReminder(hour: number, minute: number = 0): Promise<boolean> {
  const granted = await getNotificationPermission();
  if (granted !== 'granted') return false;
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: '🎵 Naam Bolo',
      body: "Today's Bollywood mix is waiting. Can you guess them all?",
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });
  track('daily_reminder_scheduled', { hour, minute });
  return true;
}

export async function cancelDailyReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
    track('daily_reminder_cancelled');
  } catch {
    /* already cancelled — fine */
  }
}

export async function hasScheduledDailyReminder(): Promise<boolean> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === DAILY_REMINDER_ID);
}
