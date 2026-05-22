import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { TeamAvatar } from '../components/TeamAvatar';
import { PALETTE_PRESETS, type Team } from '../data/teams';
import { colors, radius } from '../theme/tokens';

type Props = {
  teams: Team[];
  setTeams: (t: Team[]) => void;
  onContinue: () => void;
  onBack: () => void;
};

export function TeamsScreen({ teams, setTeams, onContinue, onBack }: Props) {
  const updateTeam = (i: number, patch: Partial<Team>) => {
    setTeams(teams.map((t, idx) => (idx === i ? { ...t, ...patch } : t)));
  };

  const cyclePalette = (i: number) => {
    const cur = teams[i];
    const currentIdx = PALETTE_PRESETS.findIndex(
      ([a, b]) => a === cur.color1 && b === cur.color2,
    );
    const next = PALETTE_PRESETS[(currentIdx + 1) % PALETTE_PRESETS.length];
    updateTeam(i, { color1: next[0], color2: next[1] });
  };

  const addTeam = () => {
    if (teams.length >= 4) return;
    const next = PALETTE_PRESETS[teams.length % PALETTE_PRESETS.length];
    setTeams([
      ...teams,
      {
        name: `Team ${teams.length + 1}`,
        score: 0,
        emoji: String(teams.length + 1),
        color1: next[0],
        color2: next[1],
      },
    ]);
  };

  const removeTeam = (i: number) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((_, idx) => idx !== i));
  };

  return (
    <ScreenLayout scroll onBack={onBack}>
      <Text style={styles.label}>STEP 1 OF 2</Text>
      <Text style={styles.title}>The teams.</Text>

      {teams.map((t, i) => (
        <View key={i} style={styles.row}>
          <Pressable onPress={() => cyclePalette(i)}>
            <TeamAvatar team={t} size={56} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <TextInput
              style={styles.name}
              value={t.name}
              onChangeText={(v) => updateTeam(i, { name: v, emoji: v.charAt(0).toUpperCase() || '?' })}
              placeholderTextColor={colors.inkFaint}
              maxLength={20}
            />
            <Text style={styles.hint}>Tap avatar to cycle colors</Text>
          </View>
          {teams.length > 2 ? (
            <Pressable onPress={() => removeTeam(i)} hitSlop={10}>
              <Text style={styles.remove}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      ))}

      {teams.length < 4 ? (
        <Pressable onPress={addTeam} style={styles.addRow}>
          <Text style={styles.addText}>+ Add team</Text>
        </Pressable>
      ) : null}

      <FilmiButton
        label="Continue →"
        variant="primary"
        onPress={onContinue}
        style={{ marginTop: 24 }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 36, fontStyle: 'italic', marginTop: 6, marginBottom: 22 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
    marginBottom: 10,
  },
  name: { color: colors.ink, fontSize: 18, fontStyle: 'italic', fontWeight: '600' },
  hint: { color: colors.inkFaint, fontSize: 11, marginTop: 2 },
  remove: { color: colors.danger, fontSize: 18, paddingHorizontal: 8 },
  addRow: {
    padding: 14,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 4,
  },
  addText: { color: colors.inkDim, fontSize: 14, fontWeight: '600' },
});
