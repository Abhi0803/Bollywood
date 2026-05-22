import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HINTS, type Song, type HintKey } from '../data/catalog';
import { colors, radius } from '../theme/tokens';

type Props = {
  song: Song;
  hintsUsed: HintKey[];
  onReveal: (key: HintKey) => void;
  onClose: () => void;
};

function hintValue(song: Song, key: HintKey): string {
  switch (key) {
    case 'year':
      return String(song.year);
    case 'mood':
      return song.mood;
    case 'director':
      return song.director;
    case 'cast':
      return song.cast;
    case 'plot':
      return song.plot;
  }
}

export function HintsOverlay({ song, hintsUsed, onReveal, onClose }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Hints.</Text>
        <Pressable onPress={onClose} hitSlop={12} style={styles.close}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>
      <Text style={styles.sub}>Each hint costs points. Used: {hintsUsed.length} / {HINTS.length}</Text>

      <View style={{ marginTop: 16, gap: 10 }}>
        {HINTS.map((h) => {
          const revealed = hintsUsed.includes(h.key);
          return (
            <Pressable
              key={h.key}
              onPress={() => !revealed && onReveal(h.key)}
              style={[styles.card, revealed && styles.cardRevealed]}>
              <View style={styles.cardHead}>
                <Text style={styles.icon}>{h.icon}</Text>
                <Text style={styles.cardLabel}>{h.label}</Text>
                <View style={styles.costBadge}>
                  <Text style={styles.costText}>
                    {revealed ? `−${h.cost}` : `${h.cost} pts`}
                  </Text>
                </View>
              </View>
              {revealed ? (
                <Text style={styles.revealedValue}>{hintValue(song, h.key)}</Text>
              ) : (
                <Text style={styles.tapHint}>Tap to reveal</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: 22,
    paddingTop: 64,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: colors.ink, fontSize: 36, fontStyle: 'italic' },
  sub: { color: colors.inkDim, fontSize: 13, marginTop: 6 },
  close: { padding: 8 },
  closeText: { color: colors.ink, fontSize: 18, fontWeight: '700' },
  card: {
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
  },
  cardRevealed: {
    backgroundColor: colors.gold,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  icon: { color: colors.gold, fontSize: 20, marginRight: 10 },
  cardLabel: { flex: 1, color: colors.ink, fontSize: 15, fontWeight: '700' },
  costBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.bgDeep,
  },
  costText: { color: colors.gold, fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  revealedValue: { color: '#160828', fontSize: 15, marginTop: 10, fontWeight: '600' },
  tapHint: { color: colors.inkFaint, fontSize: 12, marginTop: 8 },
});
