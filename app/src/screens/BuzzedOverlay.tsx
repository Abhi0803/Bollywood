import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { FilmiButton } from '../components/FilmiButton';
import { TeamAvatar } from '../components/TeamAvatar';
import type { Song } from '../data/catalog';
import type { Team } from '../data/teams';
import { colors, radius } from '../theme/tokens';

type Props = {
  team: Team;
  song: Song;
  onCorrect: () => void;
  onWrong: () => void;
  onCancel: () => void;
};

export function BuzzedOverlay({ team, song, onCorrect, onWrong, onCancel }: Props) {
  // Hide the answer by default so players who glance at the host's screen
  // don't spoil the round. Host taps to reveal, then judges.
  const [revealed, setRevealed] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: team.color1 }]}>
      <Text style={styles.label}>BUZZED · MUSIC PAUSED</Text>
      <TeamAvatar team={team} size={100} style={{ marginTop: 18 }} />
      <Text style={styles.name}>{team.name}</Text>
      <Text style={styles.prompt}>Name the movie…</Text>

      {revealed ? (
        <View style={styles.answerCard}>
          <Text style={styles.answerLabel}>ANSWER · HOST ONLY</Text>
          <Text style={styles.answerSong}>{song.song}</Text>
          <View style={styles.divider} />
          <Text style={styles.answerMovie}>{song.movie}</Text>
          <Text style={styles.answerMeta}>{song.year} · dir. {song.director}</Text>
        </View>
      ) : (
        <Pressable onPress={() => setRevealed(true)} style={styles.revealBtn}>
          <Text style={styles.revealText}>👁  Tap to reveal answer</Text>
        </Pressable>
      )}

      <View style={styles.actions}>
        <FilmiButton label="✓  Correct — award the point" variant="gold" onPress={onCorrect} />
        <FilmiButton label="✗  Wrong — resume music" variant="ghost" onPress={onWrong} />
        <Pressable onPress={onCancel} style={styles.cancelBtn} hitSlop={8}>
          <Text style={styles.cancelText}>↺  Cancel round — both heard the answer</Text>
        </Pressable>
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
  revealBtn: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: radius.button,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  revealText: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  answerCard: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: radius.card,
    backgroundColor: 'rgba(22,8,40,0.85)',
    borderWidth: 1,
    borderColor: colors.gold,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  answerLabel: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
  },
  answerSong: {
    color: colors.ink,
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '40%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 10,
  },
  answerMovie: {
    color: colors.ink,
    fontSize: 24,
    fontStyle: 'italic',
    fontWeight: '700',
    textAlign: 'center',
  },
  answerMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    marginTop: 28,
    alignSelf: 'stretch',
    gap: 10,
  },
  cancelBtn: {
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
  },
  cancelText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
});
