import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { TeamAvatar } from '../components/TeamAvatar';
import type { Song } from '../data/catalog';
import type { Team } from '../data/teams';
import { colors, radius } from '../theme/tokens';

type Props = {
  song: Song;
  teams: Team[];
  round: number;
  totalRounds: number;
  timeLeft: number;
  maxTime: number;
  hintsOn: boolean;
  hintsUsedCount: number;
  onBuzz: (teamIdx: number) => void;
  onHints: () => void;
  onSkip: () => void;
  onCancel: () => void;
};

export function PlayingScreen({
  song,
  teams,
  round,
  totalRounds,
  timeLeft,
  maxTime,
  hintsOn,
  hintsUsedCount,
  onBuzz,
  onHints,
  onSkip,
  onCancel,
}: Props) {
  const pct = maxTime > 0 ? Math.max(0, Math.min(1, timeLeft / maxTime)) : 0;
  const lowTime = timeLeft <= 10;

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={styles.roundLabel}>
          Round <Text style={styles.roundNum}>{round}</Text> / {totalRounds}
        </Text>
        <View style={[styles.timer, lowTime && styles.timerLow]}>
          <Text style={[styles.timerText, lowTime && { color: colors.filmi }]}>{timeLeft}</Text>
        </View>
      </View>

      <Text style={styles.label}>Now playing.</Text>

      <View style={styles.mystery}>
        <Text style={styles.mysteryGlyph}>?</Text>
        <View style={styles.timerBar}>
          <View
            style={[
              styles.timerFill,
              { width: `${pct * 100}%`, backgroundColor: lowTime ? colors.filmi : colors.gold },
            ]}
          />
        </View>
        <Text style={styles.waveform}>~ ~ ~ ~ ~ ~ ~</Text>
      </View>

      <View style={styles.actionsRow}>
        {hintsOn ? (
          <FilmiButton
            label={`✦ Need a hint?  ${hintsUsedCount}/5`}
            variant="ghost"
            onPress={onHints}
            style={{ flex: 1 }}
          />
        ) : null}
        <Pressable onPress={onCancel} style={styles.cancel} hitSlop={8}>
          <Text style={styles.cancelText}>↺ Cancel</Text>
        </Pressable>
        <Pressable onPress={onSkip} style={styles.skip} hitSlop={8}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.buzzRow}>
        {teams.map((t, i) => (
          <Pressable
            key={i}
            onPress={() => onBuzz(i)}
            style={({ pressed }) => [
              styles.buzz,
              { backgroundColor: t.color1, shadowColor: t.color1 },
              pressed && { opacity: 0.85 },
            ]}>
            <TeamAvatar team={t} size={42} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.buzzName} numberOfLines={1}>
                {t.name}
              </Text>
              <Text style={styles.buzzSub}>Tap to buzz</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Hidden in-game; only used so QA can verify song selection */}
      <Text style={styles.invisible}>{song.id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: 22,
    paddingTop: 64,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundLabel: { color: colors.inkDim, fontSize: 13, fontWeight: '500' },
  roundNum: { color: colors.ink, fontWeight: '700' },
  timer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerLow: { borderColor: colors.filmi },
  timerText: { color: colors.gold, fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  label: { color: colors.gold, fontSize: 22, fontStyle: 'italic', marginTop: 18 },
  mystery: {
    flex: 1,
    marginTop: 22,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingVertical: 32,
  },
  mysteryGlyph: {
    color: colors.gold,
    fontSize: 160,
    fontStyle: 'italic',
    fontWeight: '700',
    opacity: 0.85,
  },
  timerBar: {
    height: 6,
    width: '100%',
    backgroundColor: colors.line,
    borderRadius: 3,
    marginTop: 26,
    overflow: 'hidden',
  },
  timerFill: { height: 6, borderRadius: 3 },
  waveform: { color: colors.gold, fontSize: 26, letterSpacing: 6, marginTop: 16 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  cancel: { paddingHorizontal: 10, justifyContent: 'center' },
  cancelText: { color: colors.gold, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  skip: { paddingHorizontal: 10, justifyContent: 'center' },
  skipText: { color: colors.inkFaint, fontSize: 13, fontWeight: '600' },
  buzzRow: { marginTop: 14, gap: 10 },
  buzz: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  buzzName: { color: colors.ink, fontSize: 18, fontStyle: 'italic', fontWeight: '700' },
  buzzSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2, fontWeight: '600' },
  invisible: { width: 0, height: 0, opacity: 0 },
});
