import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { ScreenLayout } from '../components/ScreenLayout';
import {
  cancelDailyReminder,
  hasScheduledDailyReminder,
  requestNotificationPermission,
  scheduleDailyReminder,
} from '../lib/notifications';
import type { MusicService, User } from '../state/types';
import { colors, radius } from '../theme/tokens';

// Default daily reminder time — 7 PM local time. Most people are home,
// done with work, ready to play.
const REMINDER_HOUR = 19;

type Props = {
  user: User | null;
  service: MusicService | null;
  onChangeService: () => void;
  onDisconnect: () => void;
  onSignOut: () => void;
  onBack: () => void;
};

const serviceLabel = (s: MusicService | null): string => {
  if (s === 'apple') return 'Apple Music';
  if (s === 'spotify') return 'Spotify';
  if (s === '30s') return '30-second previews';
  return 'None linked';
};

export function SettingsScreen({
  user,
  service,
  onChangeService,
  onDisconnect,
  onSignOut,
  onBack,
}: Props) {
  const [reminderOn, setReminderOn] = useState(false);

  // Hydrate the toggle state from whatever's actually scheduled, so it
  // survives app restarts (notification scheduling persists at OS level).
  useEffect(() => {
    void hasScheduledDailyReminder().then(setReminderOn);
  }, []);

  const onToggleReminder = async (next: boolean) => {
    if (next) {
      const status = await requestNotificationPermission();
      if (status !== 'granted') {
        Alert.alert(
          'Notifications are off',
          'Enable notifications for Naam Bolo in iOS Settings, then try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }
      const ok = await scheduleDailyReminder(REMINDER_HOUR);
      setReminderOn(ok);
    } else {
      await cancelDailyReminder();
      setReminderOn(false);
    }
  };

  return (
    <ScreenLayout scroll onBack={onBack}>
      <Text style={styles.title}>Settings.</Text>

      <Text style={styles.section}>PROFILE</Text>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name ?? 'A').charAt(0)}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={styles.rowTitle}>{user?.name ?? 'Player'}</Text>
          <Text style={styles.rowSub}>{user?.email ?? 'not signed in'}</Text>
        </View>
      </View>

      <Text style={styles.section}>CONNECTED MUSIC</Text>
      <View style={styles.card}>
        <View style={[styles.dot, { backgroundColor: service ? colors.success : colors.inkFaint }]} />
        <Text style={styles.rowTitle}>{serviceLabel(service)}</Text>
        {service ? <Text style={styles.badge}>● ACTIVE</Text> : null}
      </View>
      <Pressable onPress={onChangeService} style={styles.actionRow}>
        <Text style={styles.actionText}>Change music source</Text>
        <Text style={styles.caret}>›</Text>
      </Pressable>
      {service ? (
        <Pressable onPress={onDisconnect} style={styles.actionRow}>
          <Text style={[styles.actionText, { color: colors.danger }]}>Disconnect</Text>
        </Pressable>
      ) : null}

      <Text style={styles.section}>NOTIFICATIONS</Text>
      <View style={[styles.actionRow, { paddingVertical: 16 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.actionText}>Daily reminder</Text>
          <Text style={styles.rowSub}>Nudge at 7 PM. Today's mix is waiting.</Text>
        </View>
        <Switch
          value={reminderOn}
          onValueChange={onToggleReminder}
          trackColor={{ false: colors.line, true: colors.filmi }}
          thumbColor={colors.ink}
          ios_backgroundColor={colors.line}
        />
      </View>

      <Text style={styles.section}>ACCOUNT</Text>
      <Pressable
        style={styles.actionRow}
        onPress={() => Linking.openURL('https://abhi0803.github.io/Bollywood/privacy')}
      >
        <Text style={styles.actionText}>Privacy & data</Text>
        <Text style={styles.caret}>›</Text>
      </Pressable>
      <Pressable
        style={styles.actionRow}
        onPress={() => Linking.openURL('mailto:jhaabhinav08@gmail.com?subject=Naam%20Bolo%20feedback')}
      >
        <Text style={styles.actionText}>Help & feedback</Text>
        <Text style={styles.caret}>›</Text>
      </Pressable>
      <Pressable style={styles.actionRow}>
        <Text style={styles.actionText}>About</Text>
        <Text style={styles.rowSub}>v1.2.0</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          Alert.alert('Sign out?', 'You can sign back in any time with your email.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign out', style: 'destructive', onPress: onSignOut },
          ])
        }
        style={styles.actionRow}
      >
        <Text style={[styles.actionText, { color: colors.danger }]}>Sign out</Text>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 38, fontStyle: 'italic', marginBottom: 10 },
  section: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.filmi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.ink, fontWeight: '700', fontSize: 18, fontStyle: 'italic' },
  rowTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  rowSub: { color: colors.inkDim, fontSize: 12, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  badge: { color: colors.success, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  actionText: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: '500' },
  caret: { color: colors.inkFaint, fontSize: 18 },
});
