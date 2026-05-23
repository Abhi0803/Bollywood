import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Chip } from '../components/Chip';
import { FilmiButton } from '../components/FilmiButton';
import { ScreenLayout } from '../components/ScreenLayout';
import {
  ALL_ERAS,
  ALL_MOODS,
  type Era,
  type Mood,
  type Popularity,
  type Song,
} from '../data/catalog';
import { searchSongs, type ITunesTrack } from '../services/itunesApi';
import { addUserSong } from '../state/userCatalog';
import { colors, radius } from '../theme/tokens';

type Props = {
  onBack: () => void;
  onSaved: () => void;
};

const POP_OPTIONS: { value: Popularity; label: string; hint: string }[] = [
  { value: 1, label: 'Iconic', hint: 'Everyone knows it' },
  { value: 2, label: 'Known', hint: 'Bollywood fans know' },
  { value: 3, label: 'Deep cut', hint: 'For hardcore fans' },
];

function inferEra(year: number): Era {
  if (year < 2000) return '90s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

export function AddSongScreen({ onBack, onSaved }: Props) {
  const [term, setTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ITunesTrack[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Form state — populated when the user picks an iTunes result
  const [picked, setPicked] = useState<ITunesTrack | null>(null);
  const [song, setSong] = useState('');
  const [movie, setMovie] = useState('');
  const [year, setYear] = useState('');
  const [director, setDirector] = useState('');
  const [cast, setCast] = useState('');
  const [plot, setPlot] = useState('');
  const [era, setEra] = useState<Era>('2010s');
  const [mood, setMood] = useState<Mood>('Romantic');
  const [popularity, setPopularity] = useState<Popularity>(2);
  const [saving, setSaving] = useState(false);

  const onSearch = async () => {
    if (!term.trim()) return;
    Keyboard.dismiss();
    setSearching(true);
    setError(null);
    try {
      const r = await searchSongs(term.trim(), { limit: 12 });
      setResults(r);
      if (r.length === 0) setError('No tracks with previews. Try a different search.');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const onPickResult = (track: ITunesTrack) => {
    setPicked(track);
    setSong(track.trackName);
    // collectionName usually includes "(From X)" suffix — strip it.
    const cleanedMovie = (track.collectionName ?? '').replace(/\s*\(.*?\)\s*$/, '').trim();
    setMovie(cleanedMovie);
    const releaseYear = track.releaseDate ? Number(track.releaseDate.slice(0, 4)) : 0;
    setYear(releaseYear ? String(releaseYear) : '');
    if (releaseYear) setEra(inferEra(releaseYear));
    if (!director) setDirector('');
    if (!cast) setCast(track.artistName);
    if (!plot) setPlot('');
  };

  const canSave =
    song.trim().length > 0 &&
    movie.trim().length > 0 &&
    /^(19|20)\d{2}$/.test(year);

  const onSave = async () => {
    if (!canSave) {
      Alert.alert('Missing required fields', 'Song name, movie name, and a 4-digit year are required.');
      return;
    }
    setSaving(true);
    try {
      const newSong: Omit<Song, 'id'> = {
        song: song.trim(),
        movie: movie.trim(),
        year: Number(year),
        director: director.trim() || 'Unknown',
        cast: cast.trim() || 'Unknown',
        plot: plot.trim() || `A song from ${movie.trim()}.`,
        duration: picked?.trackTimeMillis ? Math.round(picked.trackTimeMillis / 1000) : 240,
        swatch: ['#ff2d6f', '#ffd166'],
        era,
        mood,
        popularity,
      };
      await addUserSong(newSong);
      Alert.alert('Saved', `"${newSong.song}" added to your catalog.`, [
        { text: 'OK', onPress: onSaved },
      ]);
    } catch (e: unknown) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenLayout scroll onBack={onBack}>
      <Text style={styles.label}>ADD A SONG</Text>
      <Text style={styles.title}>Search iTunes.</Text>
      <Text style={styles.sub}>
        Find the song on iTunes first (so the game can play its preview), then fill in the details we need for the guessing experience.
      </Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={term}
          onChangeText={setTerm}
          placeholder="e.g. Kesariya Brahmastra"
          placeholderTextColor={colors.inkFaint}
          onSubmitEditing={onSearch}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={onSearch} disabled={searching} style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>{searching ? '…' : 'Search'}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {searching ? (
        <ActivityIndicator color={colors.gold} style={{ marginTop: 18 }} />
      ) : (
        <ScrollView horizontal style={{ marginTop: 12 }} showsHorizontalScrollIndicator={false}>
          {results.map((r) => {
            const isPicked = picked?.trackId === r.trackId;
            return (
              <Pressable
                key={r.trackId}
                onPress={() => onPickResult(r)}
                style={[styles.resultCard, isPicked && styles.resultCardActive]}>
                {r.artworkUrl100 ? (
                  <Image source={{ uri: r.artworkUrl100 }} style={styles.artwork} />
                ) : (
                  <View style={[styles.artwork, { backgroundColor: colors.purple }]} />
                )}
                <Text style={styles.resultTitle} numberOfLines={1}>{r.trackName}</Text>
                <Text style={styles.resultSub} numberOfLines={1}>{r.artistName}</Text>
                <Text style={styles.resultMeta} numberOfLines={1}>
                  {r.collectionName ? r.collectionName : '—'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {picked ? (
        <View style={styles.formCard}>
          <Text style={styles.section}>DETAILS</Text>

          <Field label="Song title" value={song} onChangeText={setSong} />
          <Field label="Movie name" value={movie} onChangeText={setMovie} />
          <Field
            label="Year"
            value={year}
            onChangeText={(v) => {
              setYear(v);
              const n = Number(v);
              if (/^(19|20)\d{2}$/.test(v)) setEra(inferEra(n));
            }}
            keyboardType="number-pad"
            maxLength={4}
          />
          <Field label="Director" value={director} onChangeText={setDirector} placeholder="(optional)" />
          <Field label="Cast" value={cast} onChangeText={setCast} placeholder="2-4 leads, comma separated" />
          <Field
            label="Plot (one line)"
            value={plot}
            onChangeText={setPlot}
            multiline
            placeholder="(optional — used as the 'plot' hint)"
          />

          <Text style={styles.section}>ERA</Text>
          <View style={styles.chipRow}>
            {ALL_ERAS.map((e) => (
              <Chip key={e} label={e} active={era === e} onPress={() => setEra(e)} />
            ))}
          </View>

          <Text style={styles.section}>MOOD</Text>
          <View style={styles.chipRow}>
            {ALL_MOODS.map((m) => (
              <Chip key={m} label={m} active={mood === m} onPress={() => setMood(m)} />
            ))}
          </View>

          <Text style={styles.section}>POPULARITY</Text>
          <View style={styles.segmented}>
            {POP_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => setPopularity(opt.value)}
                style={[styles.seg, popularity === opt.value && styles.segActive]}>
                <Text
                  style={[styles.segText, popularity === opt.value && styles.segTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.popHint}>
            {POP_OPTIONS.find((o) => o.value === popularity)?.hint}
          </Text>

          <FilmiButton
            label={saving ? 'Saving…' : '✓  Save to my catalog'}
            variant="gold"
            onPress={onSave}
            disabled={saving || !canSave}
            style={{ marginTop: 22 }}
          />
          <Text style={styles.disclaimer}>
            Saved to your device's user catalog. The picker mixes these with the bundled songs. Reset via Settings if needed.
          </Text>
        </View>
      ) : (
        <Text style={styles.empty}>Search above, then tap a result to fill the form.</Text>
      )}
    </ScreenLayout>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
}) {
  return (
    <View style={{ marginTop: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.fieldInput, multiline && { minHeight: 60, paddingTop: 12 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        multiline={multiline}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize="sentences"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  title: { color: colors.ink, fontSize: 32, fontStyle: 'italic', marginTop: 6 },
  sub: { color: colors.inkDim, fontSize: 13, marginTop: 8, lineHeight: 18 },
  searchRow: { flexDirection: 'row', marginTop: 18, gap: 10 },
  input: {
    flex: 1,
    backgroundColor: colors.bgCard,
    color: colors.ink,
    borderRadius: radius.button,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: colors.filmi,
    borderRadius: radius.button,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  searchBtnText: { color: colors.ink, fontWeight: '700' },
  error: { color: colors.danger, marginTop: 10, fontSize: 13 },
  empty: { color: colors.inkFaint, textAlign: 'center', marginTop: 30, fontSize: 13 },
  resultCard: {
    width: 160,
    marginRight: 10,
    padding: 10,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  resultCardActive: { borderColor: colors.gold },
  artwork: { width: '100%', aspectRatio: 1, borderRadius: 8 },
  resultTitle: { color: colors.ink, fontSize: 13, fontWeight: '600', marginTop: 8 },
  resultSub: { color: colors.inkDim, fontSize: 11, marginTop: 2 },
  resultMeta: { color: colors.inkFaint, fontSize: 10, marginTop: 2 },
  formCard: {
    marginTop: 18,
    padding: 18,
    borderRadius: radius.card,
    backgroundColor: colors.bgCard,
  },
  section: {
    color: colors.gold,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  fieldLabel: { color: colors.inkDim, fontSize: 10, letterSpacing: 1, fontWeight: '700', marginBottom: 4 },
  fieldInput: {
    backgroundColor: colors.bgDeep,
    color: colors.ink,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segmented: { flexDirection: 'row', backgroundColor: colors.bgDeep, borderRadius: 999, padding: 4 },
  seg: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 999 },
  segActive: { backgroundColor: colors.gold },
  segText: { color: colors.inkDim, fontSize: 13, fontWeight: '600' },
  segTextActive: { color: '#160828' },
  popHint: { color: colors.inkDim, fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  disclaimer: { color: colors.inkFaint, fontSize: 11, marginTop: 10, lineHeight: 15, textAlign: 'center' },
});
