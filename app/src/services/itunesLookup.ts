import { searchSongs, type ITunesTrack } from './itunesApi';
import type { Song } from '../data/catalog';

// Cache keyed by id+song+movie so a catalog edit invalidates the entry.
// Stores null for "no usable match" — prevents repeated network calls
// every round for songs iTunes can't find.
const cache = new Map<string, ITunesTrack | null>();

// Minimum match confidence required to actually use an iTunes result.
// Below this, prefer silence over wrong audio: a missing 30s clip just
// runs the round out; a 30s clip of the wrong song from the wrong movie
// makes the game lie to the players. See the user-reported case where
// "Hua Main Reprise" / "Animal" searched into a Tu Jhoothi Main Makkaar
// track — score was 1 (preview-exists bonus only), no title or album
// overlap. With this threshold that match is rejected.
const SCORE_THRESHOLD = 5;

// Terms that confuse iTunes fuzzy search when included in a query. The
// retry strategy strips these from song titles and tries again — usually
// finds the original recording, which still sounds basically identical
// to the reprise/remix for game purposes.
const NOISE_PATTERNS = [
  /\(\s*(reprise[d]?|unplugged|remix|extended|short version|long version|club mix|rock version|female version|male version|instrumental|cover|version)\s*\)/gi,
  /\b(reprise[d]?|unplugged|remix|extended|club mix|rock version|female version|male version|instrumental)\b/gi,
];

function stripNoise(title: string): string {
  let out = title;
  for (const pat of NOISE_PATTERNS) out = out.replace(pat, ' ');
  return out.replace(/\s+/g, ' ').trim();
}

function keyFor(s: Song): string {
  return `${s.id}::${s.song}::${s.movie}`;
}

function scoreMatch(track: ITunesTrack, song: Song): number {
  let s = 0;
  const t = track.trackName.toLowerCase();
  const wanted = song.song.toLowerCase();
  if (t === wanted) s += 5;
  else if (t.startsWith(wanted) || wanted.startsWith(t)) s += 3;
  else if (t.includes(wanted) || wanted.includes(t)) s += 1;
  const album = (track.collectionName ?? '').toLowerCase();
  if (album.includes(song.movie.toLowerCase())) s += 3;
  if (track.previewUrl) s += 1;
  return s;
}

async function trySearch(term: string): Promise<ITunesTrack[]> {
  try {
    return await searchSongs(term, { limit: 15 });
  } catch {
    return [];
  }
}

function pickBest(results: ITunesTrack[], song: Song): { track: ITunesTrack | null; score: number } {
  const withPreview = results.filter((r) => r.previewUrl);
  if (withPreview.length === 0) return { track: null, score: 0 };
  const ranked = [...withPreview].sort((a, b) => scoreMatch(b, song) - scoreMatch(a, song));
  const track = ranked[0];
  return { track, score: scoreMatch(track, song) };
}

export async function lookupTrack(song: Song): Promise<ITunesTrack | null> {
  const key = keyFor(song);
  if (cache.has(key)) return cache.get(key) ?? null;

  // First pass: full song + movie title
  let { track, score } = pickBest(
    await trySearch(`${song.song} ${song.movie}`),
    song,
  );

  // Retry without noise words ("Reprise", "Remix", etc) if the first pass
  // didn't clear the confidence bar. The cleaned-title query often finds
  // the original recording which is musically very similar.
  if (!track || score < SCORE_THRESHOLD) {
    const cleaned = stripNoise(song.song);
    if (cleaned && cleaned.toLowerCase() !== song.song.toLowerCase()) {
      const retry = pickBest(await trySearch(`${cleaned} ${song.movie}`), song);
      if (retry.track && retry.score > score) {
        track = retry.track;
        score = retry.score;
      }
    }
  }

  // Final gate: only accept matches above the confidence threshold.
  // Below threshold, treat as no-preview-available (round runs out
  // silently — bad UX but better than playing the wrong song).
  if (track && score >= SCORE_THRESHOLD) {
    cache.set(key, track);
    return track;
  }
  cache.set(key, null);
  return null;
}
