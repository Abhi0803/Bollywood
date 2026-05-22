import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { searchSongs, type ITunesTrack } from '../services/itunesApi';
import { colors, radius, spacing } from '../theme/tokens';

const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

export function PreviewPocScreen() {
  const [term, setTerm] = useState('tum hi ho');
  const [tracks, setTracks] = useState<ITunesTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const player = useAudioPlayer(SILENT_WAV);
  const status = useAudioPlayerStatus(player);

  const onSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchSongs(term);
      setTracks(results);
      if (results.length === 0) {
        setError('No results with preview URLs.');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTrack = (track: ITunesTrack) => {
    if (!track.previewUrl) return;
    if (activeId === track.trackId && status.playing) {
      player.pause();
      return;
    }
    if (activeId !== track.trackId) {
      player.replace(track.previewUrl);
      setActiveId(track.trackId);
    }
    player.seekTo(0);
    player.play();
  };

  return (
    <View style={styles.root}>
      <Text style={styles.label}>PHASE 0 · PREVIEW POC</Text>
      <Text style={styles.title}>iTunes preview playback.</Text>
      <Text style={styles.sub}>
        Validates the free-tier path: search → 30s previewUrl → expo-audio.
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={term}
          onChangeText={setTerm}
          placeholder="Search a Bollywood song"
          placeholderTextColor={colors.inkFaint}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onSearch}
          disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '…' : 'Search'}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={tracks}
          keyExtractor={(t) => String(t.trackId)}
          contentContainerStyle={{ paddingBottom: 60 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => {
            const isActive = item.trackId === activeId;
            const isPlaying = isActive && status.playing;
            return (
              <Pressable
                style={[styles.row, isActive && styles.rowActive]}
                onPress={() => playTrack(item)}>
                {item.artworkUrl100 ? (
                  <Image source={{ uri: item.artworkUrl100 }} style={styles.art} />
                ) : (
                  <View style={[styles.art, styles.artFallback]} />
                )}
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {item.trackName}
                  </Text>
                  <Text style={styles.rowSub} numberOfLines={1}>
                    {item.artistName}
                    {item.collectionName ? ` · ${item.collectionName}` : ''}
                  </Text>
                </View>
                <Text style={styles.play}>{isPlaying ? '❚❚' : '▶'}</Text>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            !error ? <Text style={styles.empty}>No tracks yet.</Text> : null
          }
        />
      )}

      {activeId !== null ? (
        <View style={styles.nowPlaying}>
          <Text style={styles.npLabel}>NOW PLAYING</Text>
          <Text style={styles.npTime}>
            {fmt(status.currentTime)} / {fmt(status.duration)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function fmt(s: number | undefined): string {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    paddingHorizontal: spacing.screenSide,
    paddingTop: spacing.screenTop,
  },
  label: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  title: {
    color: colors.ink,
    fontSize: 32,
    fontStyle: 'italic',
    marginTop: 6,
  },
  sub: {
    color: colors.inkDim,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  searchRow: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgCard,
    color: colors.ink,
    borderRadius: radius.button,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  button: {
    backgroundColor: colors.filmi,
    borderRadius: radius.button,
    paddingHorizontal: 20,
    justifyContent: 'center',
    shadowColor: colors.filmi,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 15,
  },
  error: {
    color: colors.danger,
    marginTop: 14,
    fontSize: 13,
  },
  empty: {
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 14,
  },
  sep: { height: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.card,
    padding: 12,
    gap: 12,
  },
  rowActive: {
    borderWidth: 1,
    borderColor: colors.gold,
  },
  art: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  artFallback: {
    backgroundColor: colors.purple,
  },
  rowText: { flex: 1 },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    color: colors.inkDim,
    fontSize: 12,
    marginTop: 2,
  },
  play: {
    color: colors.gold,
    fontSize: 18,
    paddingHorizontal: 6,
  },
  nowPlaying: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.screenSide,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  npLabel: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
  },
  npTime: {
    color: colors.ink,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
});
