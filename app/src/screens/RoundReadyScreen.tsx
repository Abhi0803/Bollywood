import { StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { TeamAvatar } from '../components/TeamAvatar';
import type { Team } from '../data/teams';
import { colors } from '../theme/tokens';

type Props = {
  round: number;
  totalRounds: number;
  teams: Team[];
  onPlay: () => void;
  onBack: () => void;
};

export function RoundReadyScreen({ round, totalRounds, teams, onPlay, onBack }: Props) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const lead = sorted[0];
  const diff = sorted.length > 1 ? sorted[0].score - sorted[1].score : 0;

  return (
    <ScreenLayout onBack={onBack}>
      <View style={styles.center}>
        <Text style={styles.label}>ROUND</Text>
        <Text style={styles.roundNum}>{String(round).padStart(2, '0')}</Text>
        <Text style={styles.of}>of {totalRounds}</Text>

        <View style={styles.teamsRow}>
          {teams.map((t, i) => (
            <View key={i} style={styles.teamCol}>
              <TeamAvatar team={t} size={72} />
              <Text style={styles.teamName} numberOfLines={1}>
                {t.name}
              </Text>
              <Text style={styles.teamScore}>{t.score}</Text>
            </View>
          ))}
        </View>

        {diff > 0 ? (
          <View style={styles.diffPill}>
            <Text style={styles.diffText}>
              {lead.name} leads by {diff}
            </Text>
          </View>
        ) : (
          <View style={styles.diffPill}>
            <Text style={styles.diffText}>All tied — anything can happen</Text>
          </View>
        )}

        <FilmiButton
          label="▶  Play the song"
          variant="gold"
          onPress={onPlay}
          style={{ marginTop: 32, alignSelf: 'stretch' }}
        />
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.gold, fontSize: 11, letterSpacing: 3, fontWeight: '700' },
  roundNum: { color: colors.ink, fontSize: 96, fontStyle: 'italic', fontWeight: '700', lineHeight: 100 },
  of: { color: colors.inkDim, fontSize: 14, marginTop: -4 },
  teamsRow: { flexDirection: 'row', gap: 32, marginTop: 28, justifyContent: 'center' },
  teamCol: { alignItems: 'center' },
  teamName: { color: colors.ink, fontSize: 14, fontStyle: 'italic', marginTop: 8, maxWidth: 100 },
  teamScore: { color: colors.gold, fontSize: 20, fontWeight: '700', marginTop: 2, fontVariant: ['tabular-nums'] },
  diffPill: {
    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.bgCard,
  },
  diffText: { color: colors.inkDim, fontSize: 12, fontWeight: '600' },
});
