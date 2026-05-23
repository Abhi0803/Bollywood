import { useCallback, useEffect, useRef, useState } from 'react';

import { HINTS, SONGS, type Song } from '../data/catalog';
import { DEFAULT_TEAMS_BY_COUNT, type Team } from '../data/teams';
import { loadRecent, recentIds, recordPlay } from './history';
import { pickReplacement, pickSongs } from '../services/songPicker';
import type {
  Filters,
  HintKey,
  HistoryEntry,
  LastWin,
  MusicService,
  Screen,
  User,
} from './types';

const DEFAULT_FILTERS: Filters = {
  eras: ['90s', '2000s', '2010s'],
  moods: [],
  rounds: 5,
  timer: 30,
  hintsOn: true,
};

export type GameState = {
  // navigation
  screen: Screen;
  prevScreen: Screen;
  // identity
  user: User | null;
  service: MusicService | null;
  // setup
  teams: Team[];
  filters: Filters;
  // active game
  round: number;
  songDeck: Song[];
  songIdx: number;
  timeLeft: number;
  maxTime: number;
  hintsUsed: HintKey[];
  showHints: boolean;
  buzzed: number | null;
  history: HistoryEntry[];
  lastWin: LastWin;
};

export type GameActions = {
  go(to: Screen): void;
  setUser(u: User | null): void;
  setService(s: MusicService | null): void;
  setTeams(t: Team[]): void;
  setTeamCount(n: 2 | 3 | 4): void;
  setFilters(updater: (f: Filters) => Filters): void;
  startGame(): void;
  playRound(): void;
  onBuzz(teamIdx: number): void;
  onCorrect(): void;
  onWrong(): void;
  finishRoundMiss(): void;
  cancelRound(): void;
  nextRound(): void;
  revealHint(key: HintKey): void;
  setShowHints(v: boolean): void;
  signOut(): void;
};

export function useGameState(): { state: GameState; actions: GameActions } {
  const [screen, setScreen] = useState<Screen>('splash');
  const [prevScreen, setPrevScreen] = useState<Screen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [service, setService] = useState<MusicService | null>(null);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS_BY_COUNT[2]);
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);
  const [round, setRound] = useState(1);
  const [songDeck, setSongDeck] = useState<Song[]>(SONGS);
  const [songIdx, setSongIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_FILTERS.timer);
  const [maxTime, setMaxTime] = useState(DEFAULT_FILTERS.timer);
  const [hintsUsed, setHintsUsed] = useState<HintKey[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [buzzed, setBuzzed] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastWin, setLastWin] = useState<LastWin>(null);

  // Recently-played IDs, persisted via AsyncStorage. Kept in a ref because the
  // picker reads it imperatively (no re-render needed on update).
  const recentIdsRef = useRef<string[]>([]);

  // Load persisted history on first mount
  useEffect(() => {
    let cancelled = false;
    loadRecent().then((records) => {
      if (!cancelled) recentIdsRef.current = recentIds(records);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist a song play (best-effort) and update the in-memory mirror.
  const markPlayed = useCallback(async (id: string) => {
    const next = await recordPlay(id);
    recentIdsRef.current = recentIds(next);
  }, []);

  // Track previous screen so Connect knows whether to return to Home or Settings
  const go = useCallback(
    (to: Screen) => {
      setPrevScreen((cur) => screen ?? cur);
      setScreen(to);
    },
    [screen],
  );

  const setFilters = useCallback(
    (updater: (f: Filters) => Filters) => setFiltersState(updater),
    [],
  );

  const startGame = useCallback(() => {
    const deck = pickSongs({
      filters,
      recentlyPlayedIds: recentIdsRef.current,
      count: filters.rounds,
    });
    setSongDeck(deck.length > 0 ? deck : SONGS.slice(0, filters.rounds));
    setSongIdx(0);
    setRound(1);
    setHistory([]);
    setTeams((cur) => cur.map((t) => ({ ...t, score: 0 })));
    setHintsUsed([]);
    setMaxTime(filters.timer);
    setTimeLeft(filters.timer);
    setShowHints(false);
    setBuzzed(null);
    setLastWin(null);
    setScreen('ready');
  }, [filters]);

  const playRound = useCallback(() => {
    setHintsUsed([]);
    setTimeLeft(filters.timer);
    setMaxTime(filters.timer);
    setBuzzed(null);
    setShowHints(false);
    setScreen('playing');
  }, [filters.timer]);

  const onBuzz = useCallback((teamIdx: number) => setBuzzed(teamIdx), []);

  const computePoints = useCallback((): number => {
    const cost = hintsUsed.reduce(
      (acc, k) => acc + (HINTS.find((h) => h.key === k)?.cost ?? 0),
      0,
    );
    return Math.max(20, 100 - cost);
  }, [hintsUsed]);

  const onCorrect = useCallback(() => {
    if (buzzed === null) return;
    const pts = computePoints();
    const teamIdx = buzzed;
    const song = songDeck[songIdx];
    const newTeams = teams.map((t, i) =>
      i === teamIdx ? { ...t, score: t.score + pts } : t,
    );
    setTeams(newTeams);
    setHistory((h) => [...h, { song, winner: newTeams[teamIdx], points: pts }]);
    setLastWin({ winner: newTeams[teamIdx], points: pts });
    setBuzzed(null);
    void markPlayed(song.id);
    setScreen('reveal');
  }, [buzzed, computePoints, markPlayed, songDeck, songIdx, teams]);

  const onWrong = useCallback(() => {
    if (buzzed === null) return;
    const teamIdx = buzzed;
    setTeams((cur) =>
      cur.map((t, i) => (i === teamIdx ? { ...t, score: Math.max(0, t.score - 10) } : t)),
    );
    setBuzzed(null);
  }, [buzzed]);

  const finishRoundMiss = useCallback(() => {
    const song = songDeck[songIdx];
    setHistory((h) => [...h, { song, winner: null, points: 0 }]);
    setLastWin(null);
    void markPlayed(song.id);
    setScreen('reveal');
  }, [markPlayed, songDeck, songIdx]);

  // Cancel current round — replace current song with a fresh one, reset round
  // state, stay on 'playing'. No score change, no recent-history entry (the
  // song wasn't actually completed — it was thrown out).
  const cancelRound = useCallback(() => {
    const replacement = pickReplacement({
      filters,
      recentlyPlayedIds: recentIdsRef.current,
      excludeIds: songDeck.map((s) => s.id),
    });
    if (replacement) {
      setSongDeck((cur) => cur.map((s, i) => (i === songIdx ? replacement : s)));
    }
    setHintsUsed([]);
    setTimeLeft(filters.timer);
    setMaxTime(filters.timer);
    setBuzzed(null);
    setShowHints(false);
  }, [filters, songDeck, songIdx]);

  const nextRound = useCallback(() => {
    if (round >= filters.rounds || songIdx >= songDeck.length - 1) {
      setScreen('summary');
      return;
    }
    setRound((r) => r + 1);
    setSongIdx((i) => i + 1);
    setLastWin(null);
    setScreen('ready');
  }, [filters.rounds, round, songDeck.length, songIdx]);

  const revealHint = useCallback(
    (key: HintKey) => setHintsUsed((cur) => (cur.includes(key) ? cur : [...cur, key])),
    [],
  );

  const setTeamCount = useCallback(
    (n: 2 | 3 | 4) => setTeams(DEFAULT_TEAMS_BY_COUNT[n]),
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
    setService(null);
    setScreen('splash');
  }, []);

  // Timer tick — only ticks during active playback, not while buzzed or hints overlay open
  useEffect(() => {
    if (screen !== 'playing' || buzzed !== null || showHints) return;
    if (timeLeft <= 0) {
      finishRoundMiss();
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, timeLeft, buzzed, showHints, finishRoundMiss]);

  return {
    state: {
      screen,
      prevScreen,
      user,
      service,
      teams,
      filters,
      round,
      songDeck,
      songIdx,
      timeLeft,
      maxTime,
      hintsUsed,
      showHints,
      buzzed,
      history,
      lastWin,
    },
    actions: {
      go,
      setUser,
      setService,
      setTeams,
      setTeamCount,
      setFilters,
      startGame,
      playRound,
      onBuzz,
      onCorrect,
      onWrong,
      finishRoundMiss,
      cancelRound,
      nextRound,
      revealHint,
      setShowHints,
      signOut,
    },
  };
}
