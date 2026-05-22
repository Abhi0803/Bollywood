import type { Era, HintKey, Mood, Song } from '../data/catalog';
import type { Team } from '../data/teams';

export type Screen =
  | 'splash'
  | 'login'
  | 'connect'
  | 'home'
  | 'settings'
  | 'teams'
  | 'filters'
  | 'ready'
  | 'playing'
  | 'reveal'
  | 'summary';

export type MusicService = '30s' | 'apple' | 'spotify';

export type User = { name: string; email: string };

export type Filters = {
  eras: Era[];
  moods: Mood[];
  rounds: number;
  timer: number;
  hintsOn: boolean;
};

export type HistoryEntry = {
  song: Song;
  winner: Team | null;
  points: number;
};

export type LastWin = { winner: Team; points: number } | null;

export { HintKey, Song, Team, Era, Mood };
