import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import type { MusicService, User } from '../state/types';
import { colors, radius } from '../theme/tokens';

type Props = {
  user: User | null;
  service: MusicService | null;
  onNewGame: () => void;
  onSettings: () => void;
  onAddSong: () => void;
};

const serviceLabel = (s: MusicService | null): string => {
  if (s === 'apple') return 'Apple Music';
  if (s === 'spotify') return 'Spotify';
  if (s === '30s') return '30s preview';
  return 'No music linked';
};

export function HomeScreen({ user, service, onNewGame, onSettings, onAddSong }: Props) {
  return (
    <ScreenLayout>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Namaste,</Text>
          <Text style={styles.name}>{user?.name ?? 'Player'}</Text>
        </View>
        <Pressable onPress={onSettings} style={styles.avatar} hitSlop={10}>
          <Text style={styles.avatarText}>{(user?.name ?? 'A').charAt(0)}</Text>
        </Pressable>
      </View>

      <View style={styles.chipRow}>
        <View style={styles.serviceChip}>
          <View style={styles.dot} />
          <Text style={styles.chipText}>{serviceLabel(service)}</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>TONIGHT'S</Text>
        <Text style={styles.heroTitle}>antakshari.</Text>
        <Text style={styles.heroSub}>
          Play the song. Name the movie. First team to shout wins.
        </Text>
        <FilmiButton label="▶  Start a new round" variant="gold" onPress={onNewGame} style={{ marginTop: 22 }} />
      </View>

      <Text style={styles.sectionLabel}>MODES</Text>
      <View style={styles.modeRow}>
        <View style={styles.modeCard}>
          <Text style={styles.modeTitle}>Classic</Text>
          <Text style={styles.modeSub}>2–4 teams · timer · hints</Text>
        </View>
        <View style={[styles.modeCard, styles.modeCardDim]}>
          <Text style={styles.modeTitle}>Solo Practice</Text>
          <Text style={styles.modeSub}>Coming soon</Text>
        </View>
      </View>

      <Pressable onPress={onAddSong} style={styles.addSongRow}>
        <Text style={styles.addSongIcon}>+</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.addSongTitle}>Add a song to your catalog</Text>
          <Text style={styles.addSongSub}>
            Missing a favourite? Search iTunes, fill in the details, save.
          </Text>
        </View>
        <Text style={styles.addSongCaret}>›</Text>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: colors.inkDim, fontSize: 13 },
  name: { color: colors.ink, fontSize: 24, fontStyle: 'italic', marginTop: 2 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.filmi,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.ink, fontWeight: '700', fontSize: 16, fontStyle: 'italic' },
  chipRow: { flexDirection: 'row', marginTop: 16 },
  serviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.bgCard,
    gap: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  chipText: { color: colors.ink, fontSize: 12, fontWeight: '600' },
  hero: {
    marginTop: 24,
    padding: 24,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroLabel: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  heroTitle: {
    color: colors.ink,
    fontSize: 42,
    fontStyle: 'italic',
    marginTop: 4,
  },
  heroSub: { color: colors.inkDim, fontSize: 14, marginTop: 8, lineHeight: 20 },
  sectionLabel: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 26,
    marginBottom: 10,
  },
  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: {
    flex: 1,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
  },
  modeCardDim: { opacity: 0.5 },
  modeTitle: { color: colors.ink, fontSize: 16, fontWeight: '700' },
  modeSub: { color: colors.inkDim, fontSize: 12, marginTop: 4 },
  addSongRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    padding: 16,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: 'rgba(255, 209, 102, 0.05)',
  },
  addSongIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    color: '#160828',
    textAlign: 'center',
    lineHeight: 36,
    fontSize: 22,
    fontWeight: '700',
  },
  addSongTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  addSongSub: { color: colors.inkDim, fontSize: 12, marginTop: 2, lineHeight: 16 },
  addSongCaret: { color: colors.inkFaint, fontSize: 22 },
});
