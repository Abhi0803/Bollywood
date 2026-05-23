import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import { TeamAvatar } from '../components/TeamAvatar';
import type { Song } from '../data/catalog';
import type { Team } from '../data/teams';
import { appleMusicSongLink } from '../services/affiliate';
import { colors, radius } from '../theme/tokens';

type Props = {
  song: Song;
  winner: Team | null;
  points: number;
  itunesTrackId?: number;
  onNext: () => void;
  onQuit: () => void;
  onBlock: () => void;
  isLast: boolean;
  wasCancelled: boolean;
};

export function RevealScreen({
  song,
  winner,
  points,
  itunesTrackId,
  onNext,
  onQuit,
  onBlock,
  isLast,
  wasCancelled,
}: Props) {
  const openInAppleMusic = () => {
    if (!itunesTrackId) return;
    Linking.openURL(appleMusicSongLink(itunesTrackId));
  };

  const confirmQuit = () =>
    Alert.alert(
      'End the game?',
      'Current scores will be discarded. Team setup and filters are saved.',
      [
        { text: 'Keep playing', style: 'cancel' },
        { text: 'End game', style: 'destructive', onPress: onQuit },
      ],
    );

  const confirmBlock = () =>
    Alert.alert(
      `Block "${song.song}"?`,
      'This song will never play on this device again.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block it', style: 'destructive', onPress: onBlock },
      ],
    );

  const nextLabel = wasCancelled
    ? 'Continue with new song →'
    : isLast
      ? 'See final scores →'
      : 'Next round →';

  return (
    <ScreenLayout scroll>
      {wasCancelled ? (
        <View style={styles.cancelBanner}>
          <Text style={styles.cancelLabel}>ROUND CANCELLED · NO POINTS AWARDED</Text>
          <Text style={styles.cancelHint}>
            Song is burned. New song coming up under the same round.
          </Text>
        </View>
      ) : null}

      <View style={[styles.poster, { backgroundColor: song.swatch[0] }]}>
        <View style={[styles.posterInner, { borderColor: song.swatch[1] }]}>
          <Text style={styles.posterLabel}>THE SONG WAS</Text>
          <Text style={styles.posterSong}>{song.song}</Text>
          <View style={styles.divider} />
          <Text style={styles.posterLabel}>FROM THE FILM</Text>
          <Text style={styles.posterMovie}>{song.movie}</Text>
          <Text style={styles.posterMeta}>
            {song.year} · dir. {song.director}
          </Text>
          <Text style={styles.posterCast}>{song.cast}</Text>
        </View>
      </View>

      {wasCancelled ? null : winner ? (
        <View style={[styles.winBadge, { backgroundColor: winner.color1 }]}>
          <TeamAvatar team={winner} size={56} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.winName}>{winner.name}</Text>
            <Text style={styles.winSub}>{points} points this round</Text>
          </View>
          <Text style={styles.winBig}>+{points}</Text>
        </View>
      ) : (
        <View style={styles.missBadge}>
          <Text style={styles.missText}>No one buzzed in time</Text>
        </View>
      )}

      {itunesTrackId ? (
        <FilmiButton
          label="🎵  Open in Apple Music"
          variant="ghost"
          onPress={openInAppleMusic}
          style={{ marginTop: 14 }}
        />
      ) : null}

      <FilmiButton
        label={nextLabel}
        variant="gold"
        onPress={onNext}
        style={{ marginTop: 14 }}
      />
      <FilmiButton
        label="End game · back to home"
        variant="ghost"
        onPress={confirmQuit}
        style={{ marginTop: 10 }}
      />
      <FilmiButton
        label="🚫 Never play this song again"
        variant="danger"
        onPress={confirmBlock}
        style={{ marginTop: 4 }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cancelBanner: {
    backgroundColor: colors.danger,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.card,
    marginTop: 4,
    marginBottom: 14,
  },
  cancelLabel: {
    color: colors.ink,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
  },
  cancelHint: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
  },
  poster: { borderRadius: radius.card, padding: 6, marginTop: 10 },
  posterInner: {
    borderRadius: radius.card - 4,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 22,
    backgroundColor: 'rgba(22,8,40,0.62)',
    alignItems: 'center',
  },
  posterLabel: { color: colors.gold, fontSize: 10, letterSpacing: 2, fontWeight: '700' },
  posterSong: {
    color: colors.ink,
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  divider: { height: 1, width: '40%', backgroundColor: colors.line, marginVertical: 14 },
  posterMovie: {
    color: colors.ink,
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  posterMeta: { color: colors.inkDim, fontSize: 13, marginTop: 8 },
  posterCast: { color: colors.inkFaint, fontSize: 11, marginTop: 4, textAlign: 'center', lineHeight: 16 },
  winBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: radius.card,
    marginTop: 18,
  },
  winName: { color: colors.ink, fontSize: 18, fontStyle: 'italic', fontWeight: '700' },
  winSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  winBig: { color: colors.gold, fontSize: 32, fontStyle: 'italic', fontWeight: '700', fontVariant: ['tabular-nums'] },
  missBadge: {
    padding: 14,
    borderRadius: radius.card,
    marginTop: 18,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
  },
  missText: { color: colors.inkDim, fontSize: 13 },
});
