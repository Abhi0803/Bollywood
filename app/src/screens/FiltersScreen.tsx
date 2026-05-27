import { useEffect } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Chip } from '../components/Chip';
import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { ALL_ERAS, ALL_MOODS, type Era, type Mood } from '../data/catalog';
import type { Difficulty, Filters } from '../state/types';
import { colors, radius } from '../theme/tokens';

type Props = {
  filters: Filters;
  setFilters: (u: (f: Filters) => Filters) => void;
  fullSongMode: boolean;
  onStart: () => void;
  onBack: () => void;
};

const ROUND_OPTIONS = [5, 7, 10, 15];
const TIMER_PREVIEW = [10, 20, 30];
// 0 = "Full Song" — no countdown, plays until someone buzzes or skips.
const TIMER_FULL = [10, 20, 30, 0];
const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; hint: string }[] = [
  { value: 'easy', label: 'Easy', hint: 'Iconic hits only' },
  { value: 'normal', label: 'Normal', hint: 'Mix of hits + lesser-known' },
  { value: 'hard', label: 'Hard', hint: 'Deep cuts allowed' },
];

export function FiltersScreen({ filters, setFilters, fullSongMode, onStart, onBack }: Props) {
  const timerOptions = fullSongMode ? TIMER_FULL : TIMER_PREVIEW;

  // If the user switches music mode (connect / disconnect Apple Music),
  // snap the timer to the nearest valid option so it never stays on an
  // invisible value (e.g. 60s when only previews are available).
  useEffect(() => {
    if (!timerOptions.includes(filters.timer)) {
      const closest = timerOptions.reduce((a, b) =>
        Math.abs(b - filters.timer) < Math.abs(a - filters.timer) ? b : a,
      );
      setFilters((f) => ({ ...f, timer: closest }));
    }
  }, [fullSongMode, filters.timer, timerOptions, setFilters]);

  const toggle = <T extends string>(arr: T[], v: T): T[] =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  return (
    <ScreenLayout scroll onBack={onBack}>
      <Text style={styles.label}>STEP 2 OF 2</Text>
      <Text style={styles.title}>Tune the round.</Text>

      <Text style={styles.section}>ERA</Text>
      <View style={styles.chipRow}>
        {ALL_ERAS.map((e) => (
          <Chip
            key={e}
            label={e}
            active={filters.eras.includes(e)}
            onPress={() => setFilters((f) => ({ ...f, eras: toggle<Era>(f.eras, e) }))}
          />
        ))}
      </View>

      <Text style={styles.section}>MOOD</Text>
      <View style={styles.chipRow}>
        {ALL_MOODS.map((m) => (
          <Chip
            key={m}
            label={m}
            active={filters.moods.includes(m)}
            onPress={() => setFilters((f) => ({ ...f, moods: toggle<Mood>(f.moods, m) }))}
          />
        ))}
      </View>

      <Text style={styles.section}>ROUNDS</Text>
      <View style={styles.segmented}>
        {ROUND_OPTIONS.map((n) => (
          <Pressable
            key={n}
            onPress={() => setFilters((f) => ({ ...f, rounds: n }))}
            style={[styles.seg, filters.rounds === n && styles.segActive]}>
            <Text style={[styles.segText, filters.rounds === n && styles.segTextActive]}>{n}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.section}>TIMER (per song)</Text>
      <View style={styles.segmented}>
        {timerOptions.map((n) => (
          <Pressable
            key={n}
            onPress={() => setFilters((f) => ({ ...f, timer: n }))}
            style={[styles.seg, filters.timer === n && styles.segActive]}>
            <Text style={[styles.segText, filters.timer === n && styles.segTextActive]}>
              {n === 0 ? '♫ Full' : `${n}s`}
            </Text>
          </Pressable>
        ))}
      </View>
      {filters.timer === 0 ? (
        <Text style={styles.difficultyHint}>
          Song plays until someone buzzes or you skip — no countdown.
        </Text>
      ) : null}

      <Text style={styles.section}>DIFFICULTY</Text>
      <View style={styles.segmented}>
        {DIFFICULTY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setFilters((f) => ({ ...f, difficulty: opt.value }))}
            style={[styles.seg, filters.difficulty === opt.value && styles.segActive]}>
            <Text
              style={[
                styles.segText,
                filters.difficulty === opt.value && styles.segTextActive,
              ]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.difficultyHint}>
        {DIFFICULTY_OPTIONS.find((o) => o.value === filters.difficulty)?.hint}
      </Text>

      <View style={styles.hintsRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hintsTitle}>Hints</Text>
          <Text style={styles.hintsSub}>Cost points · Don't reveal the movie</Text>
        </View>
        <Switch
          value={filters.hintsOn}
          onValueChange={(v) => setFilters((f) => ({ ...f, hintsOn: v }))}
          thumbColor={colors.ink}
          trackColor={{ false: colors.line, true: colors.filmi }}
        />
      </View>

      <FilmiButton
        label="▶  Start game"
        variant="gold"
        onPress={onStart}
        style={{ marginTop: 28 }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 36, fontStyle: 'italic', marginTop: 6, marginBottom: 18 },
  section: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 18,
    marginBottom: 10,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmented: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 999, padding: 4 },
  seg: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999 },
  segActive: { backgroundColor: colors.gold },
  segText: { color: colors.inkDim, fontSize: 14, fontWeight: '600' },
  segTextActive: { color: '#160828' },
  hintsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: 16,
    borderRadius: radius.card,
    marginTop: 22,
  },
  hintsTitle: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  hintsSub: { color: colors.inkDim, fontSize: 12, marginTop: 2 },
  difficultyHint: {
    color: colors.inkDim,
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
