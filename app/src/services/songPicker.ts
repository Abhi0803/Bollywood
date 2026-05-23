// Intelligent song selection.
//
// Goals:
//   1. Respect era/mood filters.
//   2. Bias toward iconic songs (popularity 1) but not exclusively — sprinkle
//      in well-known ones (popularity 2) and the occasional deep cut (3).
//   3. Avoid songs played in the recent N games (loaded from AsyncStorage by
//      the caller and passed in as recentlyPlayedIds).
//   4. When the filtered pool is too small to fill the round count, fall
//      back gracefully rather than crashing.

import { SONGS, type Popularity, type Song } from '../data/catalog';
import type { Filters } from '../state/types';

const TIER_WEIGHTS: Record<Popularity, number> = {
  1: 6, // iconic — picked most often
  2: 3, // well-known — common
  3: 1, // deep cut — rare
};

type PickArgs = {
  filters: Filters;
  recentlyPlayedIds: string[];
  count: number;
};

export function pickSongs({ filters, recentlyPlayedIds, count }: PickArgs): Song[] {
  const filtered = applyFilters(SONGS, filters);
  const pool = filtered.length > 0 ? filtered : SONGS;
  const fresh = removeRecent(pool, recentlyPlayedIds);
  const candidates = fresh.length >= count ? fresh : [...fresh, ...recentOnlyPool(pool, recentlyPlayedIds)];
  return weightedSample(candidates, count);
}

type ReplaceArgs = {
  filters: Filters;
  recentlyPlayedIds: string[];
  excludeIds: string[]; // current deck IDs, must not return any of these
};

export function pickReplacement({ filters, recentlyPlayedIds, excludeIds }: ReplaceArgs): Song | null {
  const filtered = applyFilters(SONGS, filters);
  let pool = (filtered.length > 0 ? filtered : SONGS).filter(
    (s) => !excludeIds.includes(s.id),
  );
  if (pool.length === 0) {
    // hard fallback: any song not already in the deck
    pool = SONGS.filter((s) => !excludeIds.includes(s.id));
  }
  if (pool.length === 0) return null;
  const fresh = removeRecent(pool, recentlyPlayedIds);
  const candidates = fresh.length > 0 ? fresh : pool;
  return weightedSample(candidates, 1)[0] ?? null;
}

function applyFilters(songs: Song[], filters: Filters): Song[] {
  let out = songs;
  if (filters.eras.length > 0) {
    out = out.filter((s) => filters.eras.includes(s.era));
  }
  if (filters.moods.length > 0) {
    out = out.filter((s) => filters.moods.includes(s.mood));
  }
  return out;
}

function removeRecent(songs: Song[], recentIds: string[]): Song[] {
  if (recentIds.length === 0) return songs;
  const set = new Set(recentIds);
  return songs.filter((s) => !set.has(s.id));
}

function recentOnlyPool(songs: Song[], recentIds: string[]): Song[] {
  const set = new Set(recentIds);
  return songs.filter((s) => set.has(s.id));
}

function weightedSample(songs: Song[], count: number): Song[] {
  const pool = [...songs];
  const out: Song[] = [];
  while (out.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((acc, s) => acc + TIER_WEIGHTS[s.popularity], 0);
    let r = Math.random() * totalWeight;
    let pickedIdx = 0;
    for (let j = 0; j < pool.length; j++) {
      r -= TIER_WEIGHTS[pool[j].popularity];
      if (r <= 0) {
        pickedIdx = j;
        break;
      }
    }
    out.push(pool[pickedIdx]);
    pool.splice(pickedIdx, 1);
  }
  return out;
}
