// Catalog types + loaded SONGS array.
//
// THE SONG DATA LIVES IN catalog.json — edit that file to add/remove/fix
// songs. This file is just the typed wrapper. See CATALOG_SCHEMA.md
// (same directory) for the JSON shape and field meanings.
//
// After editing catalog.json, just reload the app — no script needed.

import rawSongs from './catalog.json';

export type Era = '90s' | '2000s' | '2010s' | '2020s';
export type Mood =
  | 'Romantic'
  | 'Wedding'
  | 'Party'
  | 'Sufi'
  | 'Anthemic'
  | 'Period'
  | 'Coming-of-age'
  | 'Roadtrip';

export type Popularity = 1 | 2 | 3;

export type Song = {
  id: string;
  song: string;
  movie: string;
  year: number;
  director: string;
  cast: string;
  plot: string;
  duration: number;
  swatch: [string, string];
  era: Era;
  mood: Mood;
  popularity: Popularity;
};

export type HintKey = 'year' | 'mood' | 'director' | 'cast' | 'plot';
export type Hint = { key: HintKey; label: string; cost: number; icon: string };

// Cast through unknown because JSON modules are typed too loosely (string-
// widened era/mood, number-widened popularity, tuple-widened swatch). The
// runtime shape is guaranteed by CATALOG_SCHEMA.md + the dump script's
// validation; here we just narrow.
export const SONGS: Song[] = (rawSongs as unknown[]).map((s) => s as Song);

export const HINTS: Hint[] = [
  { key: 'year', label: 'Year of release', cost: 10, icon: '◔' },
  { key: 'mood', label: 'Mood', cost: 10, icon: '✦' },
  { key: 'director', label: 'Director', cost: 15, icon: '◐' },
  { key: 'cast', label: 'Cast', cost: 20, icon: '◑' },
  { key: 'plot', label: 'Plot snippet', cost: 25, icon: '◕' },
];

export const ALL_ERAS: Era[] = ['90s', '2000s', '2010s', '2020s'];
export const ALL_MOODS: Mood[] = [
  'Romantic',
  'Wedding',
  'Party',
  'Sufi',
  'Anthemic',
  'Period',
  'Coming-of-age',
  'Roadtrip',
];
