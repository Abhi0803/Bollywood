import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenLayout } from '../components/ScreenLayout';
import type { MusicService, User } from '../state/types';
import { colors, radius } from '../theme/tokens';

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

      <Text style={styles.section}>ACCOUNT</Text>
      <Pressable style={styles.actionRow}>
        <Text style={styles.actionText}>Privacy & data</Text>
        <Text style={styles.caret}>›</Text>
      </Pressable>
      <Pressable style={styles.actionRow}>
        <Text style={styles.actionText}>Help & feedback</Text>
        <Text style={styles.caret}>›</Text>
      </Pressable>
      <Pressable style={styles.actionRow}>
        <Text style={styles.actionText}>About</Text>
        <Text style={styles.rowSub}>v0.1.0</Text>
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
