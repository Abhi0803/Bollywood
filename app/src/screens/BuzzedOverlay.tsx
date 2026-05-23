import { StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { TeamAvatar } from '../components/TeamAvatar';
import type { Team } from '../data/teams';
import { colors } from '../theme/tokens';

type Props = {
  team: Team;
  onCorrect: () => void;
  onWrong: () => void;
  onCancel: () => void;
};

export function BuzzedOverlay({ team, onCorrect, onWrong, onCancel }: Props) {
  return (
    <View style={[styles.root, { backgroundColor: team.color1 }]}>
      <Text style={styles.label}>BUZZED · MUSIC PAUSED</Text>
      <TeamAvatar team={team} size={100} style={{ marginTop: 18 }} />
      <Text style={styles.name}>{team.name}</Text>
      <Text style={styles.prompt}>Name the movie…</Text>
      <View style={{ marginTop: 32, alignSelf: 'stretch', gap: 10 }}>
        <FilmiButton label="✓  Correct — award the point" variant="gold" onPress={onCorrect} />
        <FilmiButton label="✗  Wrong — resume music" variant="ghost" onPress={onWrong} />
        <FilmiButton
          label="↺  Cancel round — both heard the answer"
          variant="danger"
          onPress={onCancel}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 26,
    paddingVertical: 80,
    alignItems: 'center',
  },
  label: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  name: {
    color: colors.ink,
    fontSize: 38,
    fontStyle: 'italic',
    marginTop: 18,
    fontWeight: '700',
  },
  prompt: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginTop: 8,
  },
});
