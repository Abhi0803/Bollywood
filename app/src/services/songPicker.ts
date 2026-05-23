// Intelligent song selection for a single game.
//
// Goals (in priority order):
//   1. MOVIE DIVERSITY — every song in a deck should come from a different
//      movie if at all possible. This is the single biggest variety lever.
//      "Iconic" movies often have 3–5 hit songs each; without this rule, a
//      5-round deck can easily be 2 songs from DDLJ + 2 from YJHD, which
//      feels stale and lets one team's expertise dominate.
//
//   2. RECENT-HISTORY AVOIDANCE — songs played in the last N sessions
//      (persisted via expo-file-system in history.ts) drop to the bottom
//      of the candidate pool. Only used if the fresh pool is too small.
//
//   3. POPULARITY BIAS, soft — tier-1 ("iconic") songs are 2x more likely
//      than tier-3 ("deep cut"), tier-2 sits between. Old 6:3:1 weighting
//      was too aggressive — same hits dominated every game. New 2:1.5:1
//      lets known + deep-cut songs surface meaningfully.
//
//   4. FINAL SHUFFLE — the returned deck order is fully random. Avoids
//      "all 90s songs first" or "all popularity-1 first" feeling.
//
// Algorithm sketch:
//   pool ← filter(songs, era/mood)
//   if recents avoid leaves enough fresh, use fresh; else use full pool
//   group pool by movie
//   shuffle movie order; from each movie pick one song (weighted by tier within movie)
//   if not enough movies for count, fill remainder from leftover songs in already-used movies
//   shuffle deck before returning

import { SONGS, type Popularity, type Song } from '../data/catalog';
import type { Filters } from '../state/types';

const TIER_WEIGHTS: Record<Popularity, number> = {
  1: 2,
  2: 1.5,
  3: 1,
};

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function applyFilters(songs: readonly Song[], filters: Filters): Song[] {
  let out: Song[] = [...songs];
  if (filters.eras.length > 0) {
    out = out.filter((s) => filters.eras.includes(s.era));
  }
  if (filters.moods.length > 0) {
    out = out.filter((s) => filters.moods.includes(s.mood));
  }
  return out;
}

function weightedPickOne<T extends Song>(songs: readonly T[]): T {
  if (songs.length === 0) throw new Error('weightedPickOne called with empty list');
  if (songs.length === 1) return songs[0];
  const totalWeight = songs.reduce((acc, s) => acc + TIER_WEIGHTS[s.popularity], 0);
  let r = Math.random() * totalWeight;
  for (const s of songs) {
    r -= TIER_WEIGHTS[s.popularity];
    if (r <= 0) return s;
  }
  return songs[songs.length - 1];
}

function groupByMovie(songs: readonly Song[]): Map<string, Song[]> {
  const out = new Map<string, Song[]>();
  for (const s of songs) {
    const existing = out.get(s.movie);
    if (existing) existing.push(s);
    else out.set(s.movie, [s]);
  }
  return out;
}

export type PickArgs = {
  filters: Filters;
  recentlyPlayedIds: string[];
  count: number;
};

export function pickSongs({ filters, recentlyPlayedIds, count }: PickArgs): Song[] {
  // 1. Filter to era/mood
  let filtered = applyFilters(SONGS, filters);
  if (filtered.length === 0) filtered = [...SONGS];

  // 2. Split fresh (not recent) vs stale (recent); prefer fresh
  const recentSet = new Set(recentlyPlayedIds);
  const fresh = filtered.filter((s) => !recentSet.has(s.id));
  const stale = filtered.filter((s) => recentSet.has(s.id));
  const workingPool = fresh.length >= count ? fresh : [...fresh, ...stale];

  // 3. Group by movie
  const byMovie = groupByMovie(workingPool);

  // 4. Phase 1: pick one song from each movie, in random movie order
  const movieOrder = shuffle(Array.from(byMovie.keys()));
  const deck: Song[] = [];
  for (const movie of movieOrder) {
    if (deck.length >= count) break;
    const songsInMovie = byMovie.get(movie);
    if (!songsInMovie || songsInMovie.length === 0) continue;
    deck.push(weightedPickOne(songsInMovie));
  }

  // 5. Phase 2: if not enough unique movies, allow second songs from
  // already-used movies (this only happens for very narrow filters)
  if (deck.length < count) {
    const usedSongIds = new Set(deck.map((s) => s.id));
    const leftovers = shuffle(workingPool.filter((s) => !usedSongIds.has(s.id)));
    for (const s of leftovers) {
      if (deck.length >= count) break;
      deck.push(s);
    }
  }

  // 6. Final shuffle so order isn't "movie-alphabetical" by chance
  return shuffle(deck);
}

export type ReplaceArgs = {
  filters: Filters;
  recentlyPlayedIds: string[];
  excludeSongIds: string[];
  // Movies already in the deck — prefer NOT to repeat unless forced.
  // Helps the cancel-round flow stay diverse.
  excludeMovies?: string[];
};

export function pickReplacement({
  filters,
  recentlyPlayedIds,
  excludeSongIds,
  excludeMovies = [],
}: ReplaceArgs): Song | null {
  // 1. Filter, exclude current deck songs
  let pool = applyFilters(SONGS, filters).filter((s) => !excludeSongIds.includes(s.id));
  if (pool.length === 0) {
    pool = SONGS.filter((s) => !excludeSongIds.includes(s.id));
  }
  if (pool.length === 0) return null;

  // 2. Prefer fresh
  const recentSet = new Set(recentlyPlayedIds);
  const freshPool = pool.filter((s) => !recentSet.has(s.id));
  const fromFresh = freshPool.length > 0 ? freshPool : pool;

  // 3. Prefer movies not in deck
  const excludeMovieSet = new Set(excludeMovies);
  const diverseMoviePool = fromFresh.filter((s) => !excludeMovieSet.has(s.movie));
  const candidates = diverseMoviePool.length > 0 ? diverseMoviePool : fromFresh;

  return weightedPickOne(candidates);
}
