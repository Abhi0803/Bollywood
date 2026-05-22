import { StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { TeamAvatar } from '../components/TeamAvatar';
import type { Team } from '../data/teams';
import type { HistoryEntry } from '../state/types';
import { colors, radius } from '../theme/tokens';

type Props = {
  teams: Team[];
  history: HistoryEntry[];
  onRestart: () => void;
  onHome: () => void;
};

export function SummaryScreen({ teams, history, onRestart, onHome }: Props) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const tied = sorted.length > 1 && sorted[0].score === sorted[1].score;
  const winner = tied ? null : sorted[0];

  return (
    <ScreenLayout scroll>
      <Text style={styles.label}>FINAL</Text>
      {winner ? (
        <>
          <TeamAvatar team={winner} size={96} style={{ alignSelf: 'center', marginTop: 16 }} />
          <Text style={styles.winName}>{winner.name}</Text>
          <Text style={styles.winScore}>{winner.score} POINTS</Text>
        </>
      ) : (
        <Text style={styles.tied}>Tied at {sorted[0].score}</Text>
      )}

      <Text style={styles.section}>SCOREBOARD</Text>
      {sorted.map((t, i) => (
        <View
          key={i}
          style={[styles.scoreRow, i === 0 && !tied && { borderColor: t.color1 }]}>
          <TeamAvatar team={t} size={40} />
          <Text style={styles.scoreName}>{t.name}</Text>
          <Text style={styles.scoreVal}>{t.score}</Text>
        </View>
      ))}

      <Text style={styles.section}>ROUNDS</Text>
      {history.map((h, i) => (
        <View key={i} style={styles.histRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.histMovie}>{h.song.movie}</Text>
            <Text style={styles.histSong}>{h.song.song}</Text>
          </View>
          {h.winner ? (
            <View style={styles.histRight}>
              <TeamAvatar team={h.winner} size={28} />
              <Text style={styles.histPts}>+{h.points}</Text>
            </View>
          ) : (
            <Text style={styles.histMiss}>—</Text>
          )}
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
        <FilmiButton label="Home" variant="ghost" onPress={onHome} style={{ flex: 1 }} />
        <FilmiButton label="Play again" variant="gold" onPress={onRestart} style={{ flex: 1 }} />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  winName: { color: colors.ink, fontSize: 42, fontStyle: 'italic', fontWeight: '700', textAlign: 'center', marginTop: 14 },
  winScore: { color: colors.gold, fontSize: 18, fontWeight: '700', textAlign: 'center', letterSpacing: 2, marginTop: 4, fontVariant: ['tabular-nums'] },
  tied: { color: colors.ink, fontSize: 32, fontStyle: 'italic', textAlign: 'center', marginTop: 18 },
  section: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 26,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  scoreName: { flex: 1, marginLeft: 12, color: colors.ink, fontSize: 16, fontStyle: 'italic', fontWeight: '600' },
  scoreVal: { color: colors.gold, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
    marginBottom: 8,
  },
  histMovie: { color: colors.ink, fontSize: 14, fontStyle: 'italic', fontWeight: '600' },
  histSong: { color: colors.inkDim, fontSize: 11, marginTop: 2 },
  histRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  histPts: { color: colors.gold, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  histMiss: { color: colors.inkFaint, fontSize: 16, fontWeight: '700' },
});
