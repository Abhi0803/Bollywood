import { NaamMusic, type CatalogSearchResult } from '../../modules/expo-naam-music';
import type { Song } from '../data/catalog';

// Maps a catalog Song (which only knows about itself + its iTunes match)
// to an Apple Music catalog ID we can hand to ApplicationMusicPlayer.
//
// iTunes Search API and Apple Music catalog use DIFFERENT ID spaces, so
// we re-search by title+movie against Apple Music's catalog and pick the
// best match. Cached for the session (and persisted alongside other game
// state if we ever wire it up, but for now an in-memory cache is fine —
// repeated lookups of the same song are common within a single match
// but rare across sessions).

const cache = new Map<string, string | null>();

const SCORE_THRESHOLD = 4;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

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

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) {
    const ratio = Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    if (ratio >= 0.5) return Math.max(ratio, 0.8);
  }
  const maxLen = Math.max(na.length, nb.length);
  const dist = editDistance(na, nb);
  return Math.max(0, 1 - dist / maxLen);
}

function scoreMatch(r: CatalogSearchResult, song: Song): number {
  let s = 0;
  const titleSim = similarity(r.title, song.song);
  if (titleSim >= 0.85) s += 5;
  else if (titleSim >= 0.6) s += 3;
  else if (titleSim >= 0.35) s += 1;
  if (r.albumTitle) {
    const albumSim = similarity(r.albumTitle.replace(/\([^)]*\)/g, ''), song.movie);
    if (albumSim >= 0.85) s += 3;
    else if (albumSim >= 0.6) s += 1;
  }
  return s;
}

function keyFor(song: Song): string {
  return `${song.id}::${song.song}::${song.movie}`;
}

export async function findAppleMusicId(song: Song): Promise<string | null> {
  const key = keyFor(song);
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const results = await NaamMusic.searchCatalog(`${song.song} ${song.movie}`, 5);
    if (results.length === 0) {
      cache.set(key, null);
      return null;
    }
    const ranked = [...results].sort(
      (a, b) => scoreMatch(b, song) - scoreMatch(a, song),
    );
    const best = ranked[0];
    const bestScore = scoreMatch(best, song);
    if (bestScore < SCORE_THRESHOLD) {
      cache.set(key, null);
      return null;
    }
    cache.set(key, best.id);
    return best.id;
  } catch {
    cache.set(key, null);
    return null;
  }
}
