import { searchSongs, type ITunesTrack } from './itunesApi';
import type { Song } from '../data/catalog';

// Cache keyed by id+song+movie so a catalog edit invalidates the entry.
// Stores null for "no usable match" — prevents repeated network calls
// every round for songs iTunes can't find.
const cache = new Map<string, ITunesTrack | null>();

// Minimum match confidence required to actually use an iTunes result.
// Below this, prefer silence over wrong audio.
const SCORE_THRESHOLD = 5;

// Noise tokens to strip from a song title for a retry query. "Hua Main
// Reprise Animal" returns garbage from iTunes; "Hua Main Animal" returns
// the right track. The reprise/remix/etc usually sounds nearly identical
// to the base recording, so playing the base is acceptable.
const NOISE_PATTERNS = [
  /\(\s*(reprise[d]?|unplugged|remix|extended|short version|long version|club mix|rock version|female version|male version|instrumental|cover|version)\s*\)/gi,
  /\b(reprise[d]?|unplugged|remix|extended|club mix|rock version|female version|male version|instrumental)\b/gi,
];

function stripNoise(title: string): string {
  let out = title;
  for (const pat of NOISE_PATTERNS) out = out.replace(pat, ' ');
  return out.replace(/\s+/g, ' ').trim();
}

// Lowercase, strip diacritics, drop all non-alphanumeric. Lets the scorer
// treat "Senorita" === "Señorita", "Hamdard" ≈ "Humdard", "Tip Tip Barsa
// Pani" ≈ "Tip Tip Barsa Paani", etc.
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Standard Levenshtein. Cheap for the ~30-character titles we're comparing.
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = new Array<number>(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}

// 0..1 string similarity over normalized forms.
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  // Subset bonus: catalog title is exactly a substring of the iTunes title
  // (or vice versa) — common when one side has an extra word like "Toh".
  if (na.includes(nb) || nb.includes(na)) {
    const ratio = Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    if (ratio >= 0.5) return Math.max(ratio, 0.8);
  }
  const maxLen = Math.max(na.length, nb.length);
  const dist = editDistance(na, nb);
  return Math.max(0, 1 - dist / maxLen);
}

function albumMatchesMovie(album: string, movie: string): boolean {
  if (!album || !movie) return false;
  const lowerAlbum = album.toLowerCase();
  const lowerMovie = movie.toLowerCase();
  if (lowerAlbum.includes(lowerMovie)) return true;
  // Many iTunes albums use "<Movie> (Original Motion Picture Soundtrack)".
  // Strip the parenthesised suffix and compare normalized.
  const stripped = album.replace(/\([^)]*\)/g, '').trim();
  return similarity(stripped, movie) >= 0.85;
}

function keyFor(s: Song): string {
  return `${s.id}::${s.song}::${s.movie}`;
}

function scoreMatch(track: ITunesTrack, song: Song): number {
  let s = 0;
  const sim = similarity(track.trackName, song.song);
  if (sim >= 0.8) s += 5; // near-identical title (incl. spelling variants)
  else if (sim >= 0.55) s += 3; // mostly the same
  else if (sim >= 0.3) s += 1; // some overlap
  if (albumMatchesMovie(track.collectionName ?? '', song.movie)) s += 3;
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

function pickBest(
  results: ITunesTrack[],
  song: Song,
): { track: ITunesTrack | null; score: number } {
  const withPreview = results.filter((r) => r.previewUrl);
  if (withPreview.length === 0) return { track: null, score: 0 };
  const ranked = [...withPreview].sort(
    (a, b) => scoreMatch(b, song) - scoreMatch(a, song),
  );
  const track = ranked[0];
  return { track, score: scoreMatch(track, song) };
}

export async function lookupTrack(song: Song): Promise<ITunesTrack | null> {
  const key = keyFor(song);
  if (cache.has(key)) return cache.get(key) ?? null;

  let { track, score } = pickBest(
    await trySearch(`${song.song} ${song.movie}`),
    song,
  );

  // Retry without noise words — usually finds the original/base recording.
  if (!track || score < SCORE_THRESHOLD) {
    const cleaned = stripNoise(song.song);
    if (cleaned && normalize(cleaned) !== normalize(song.song)) {
      const retry = pickBest(await trySearch(`${cleaned} ${song.movie}`), song);
      if (retry.track && retry.score > score) {
        track = retry.track;
        score = retry.score;
      }
    }
  }

  if (track && score >= SCORE_THRESHOLD) {
    cache.set(key, track);
    return track;
  }
  cache.set(key, null);
  return null;
}
