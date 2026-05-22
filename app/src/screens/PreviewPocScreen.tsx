import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
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

const DEBOUNCE_MS = 350;
const SEARCH_LIMIT = 25;

export function PreviewPocScreen() {
  const [term, setTerm] = useState('tum hi ho');
  const [tracks, setTracks] = useState<ITunesTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const player = useAudioPlayer(SILENT_WAV);
  const status = useAudioPlayerStatus(player);

  const reqIdRef = useRef(0);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length === 0) {
      setTracks([]);
      setError(null);
      setLoading(false);
      return;
    }
    const id = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const results = await searchSongs(trimmed, { limit: SEARCH_LIMIT });
      if (id !== reqIdRef.current) return;
      setTracks(results);
      if (results.length === 0) setError('No results with preview URLs.');
    } catch (e: unknown) {
      if (id !== reqIdRef.current) return;
      setError(e instanceof Error ? e.message : 'Unknown error');
      setTracks([]);
    } finally {
      if (id === reqIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => runSearch(term), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [term, runSearch]);

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

  const clearSearch = () => {
    setTerm('');
    setTracks([]);
    setError(null);
  };

  const progress =
    status.duration && status.duration > 0
      ? Math.min(1, status.currentTime / status.duration)
      : 0;

  return (
    <View style={styles.root}>
      <Text style={styles.label}>PHASE 0 · PREVIEW POC</Text>
      <Text style={styles.title}>Search & play.</Text>
      <Text style={styles.sub}>
        Type any song — Bollywood, Hindi, anything. Results auto-update.
      </Text>

      <View style={styles.inputWrap}>
        <Text style={styles.inputIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={term}
          onChangeText={setTerm}
          placeholder="Search a song"
          placeholderTextColor={colors.inkFaint}
          onSubmitEditing={() => {
            Keyboard.dismiss();
            runSearch(term);
          }}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {term.length > 0 ? (
          <Pressable hitSlop={12} onPress={clearSearch} style={styles.clearBtn}>
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {loading ? 'Searching…' : `${tracks.length} result${tracks.length === 1 ? '' : 's'}`}
        </Text>
        {loading ? <ActivityIndicator size="small" color={colors.gold} /> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={tracks}
        keyExtractor={(t) => String(t.trackId)}
        contentContainerStyle={{ paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
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
                {isActive ? (
                  <View style={styles.progressTrack}>
                    <View
                      style={[styles.progressFill, { width: `${progress * 100}%` }]}
                    />
                  </View>
                ) : null}
              </View>
              <Text style={styles.play}>{isPlaying ? '❚❚' : '▶'}</Text>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading && !error && term.trim().length > 0 ? (
            <Text style={styles.empty}>No tracks yet.</Text>
          ) : null
        }
      />

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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: colors.bgCard,
    borderRadius: radius.button,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    color: colors.ink,
    paddingVertical: 14,
    fontSize: 16,
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
    minHeight: 18,
  },
  metaText: {
    color: colors.inkDim,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  error: {
    color: colors.danger,
    marginTop: 4,
    marginBottom: 8,
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
    width: 56,
    height: 56,
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
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.line,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.gold,
  },
  play: {
    color: colors.gold,
    fontSize: 20,
    paddingHorizontal: 8,
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
