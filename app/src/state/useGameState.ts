import { useCallback, useEffect, useRef, useState } from 'react';

import { HINTS, SONGS, type Song } from '../data/catalog';
import { DEFAULT_TEAMS_BY_COUNT, type Team } from '../data/teams';
import { track } from '../lib/posthog';
import { addToBlocklist, loadBlocklist } from './blocklist';
import { loadRecent, recentIds, recordPlay } from './history';
import { loadPreferences, savePreferences } from './preferences';
import { loadUserCatalog } from './userCatalog';
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
  difficulty: 'normal',
};

export type GameState = {
  screen: Screen;
  prevScreen: Screen;
  user: User | null;
  service: MusicService | null;
  teams: Team[];
  filters: Filters;
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
  // True when current Reveal is showing a song that was cancelled mid-round
  // rather than a guess / miss. Drives different Reveal copy + flow.
  lastWasCancelled: boolean;
  // Player-initiated pause — freezes timer + audio + buzz.
  isPaused: boolean;
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
  quitGame(): void;
  blockCurrentSong(): void;
  blockSongById(id: string): void;
  refreshUserCatalog(): Promise<void>;
  togglePause(): void;
  resetTimer(): void;
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
  const [teams, setTeamsState] = useState<Team[]>(DEFAULT_TEAMS_BY_COUNT[2]);
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
  const [lastWasCancelled, setLastWasCancelled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Recently-played IDs, persisted to disk. Held in a ref because the picker
  // reads it imperatively from inside other callbacks.
  const recentIdsRef = useRef<string[]>([]);
  // Blocklist of song IDs the user marked "never play again".
  const blockedIdsRef = useRef<string[]>([]);
  // User-added songs (loaded from disk, merged into picker pool).
  const userSongsRef = useRef<Song[]>([]);
  // Track whether prefs have loaded — only after this do we start saving on
  // change, so the initial render's default values don't overwrite saved ones.
  const prefsLoadedRef = useRef(false);

  // Load persisted history + preferences + blocklist + user catalog on mount.
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadRecent(),
      loadPreferences(),
      loadBlocklist(),
      loadUserCatalog(),
    ]).then(([records, prefs, blocked, userSongs]) => {
      if (cancelled) return;
      recentIdsRef.current = recentIds(records);
      blockedIdsRef.current = blocked;
      userSongsRef.current = userSongs;
      if (prefs.teams && prefs.teams.length >= 2) {
        setTeamsState(prefs.teams.map((t) => ({ ...t, score: 0 })));
      }
      if (prefs.filters) {
        setFiltersState({ ...DEFAULT_FILTERS, ...prefs.filters });
      }
      // Restore signed-in user + music service so we skip Login/Connect
      // entirely on the next launch.
      if (prefs.user) setUser(prefs.user);
      if (prefs.service) setService(prefs.service);
      prefsLoadedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Allow the AddSong screen to push new user songs into the in-memory
  // ref without forcing a full reload.
  const refreshUserCatalog = useCallback(async () => {
    userSongsRef.current = await loadUserCatalog();
  }, []);

  // Persist team setup (names + colors, not scores) whenever it changes —
  // but only after initial prefs load, so we don't clobber saved values.
  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    void savePreferences({ teams });
  }, [teams]);

  // Persist filter selections similarly.
  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    void savePreferences({ filters });
  }, [filters]);

  // Persist signed-in user across restarts (skip Login on next launch).
  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    void savePreferences({ user });
  }, [user]);

  // Persist linked music service similarly (skip Connect on next launch).
  useEffect(() => {
    if (!prefsLoadedRef.current) return;
    void savePreferences({ service });
  }, [service]);

  const markPlayed = useCallback(async (id: string) => {
    const next = await recordPlay(id);
    recentIdsRef.current = recentIds(next);
  }, []);

  const go = useCallback(
    (to: Screen) => {
      setPrevScreen((cur) => screen ?? cur);
      setScreen(to);
    },
    [screen],
  );

  // Public setter used by screens — wraps the internal state setter.
  const setTeams = useCallback((t: Team[]) => setTeamsState(t), []);

  const setFilters = useCallback(
    (updater: (f: Filters) => Filters) => setFiltersState(updater),
    [],
  );

  const startGame = useCallback(() => {
    const deck = pickSongs({
      filters,
      recentlyPlayedIds: recentIdsRef.current,
      blockedIds: blockedIdsRef.current,
      extraSongs: userSongsRef.current,
      count: filters.rounds,
    });
    setSongDeck(deck.length > 0 ? deck : SONGS.slice(0, filters.rounds));
    setSongIdx(0);
    setRound(1);
    setHistory([]);
    setTeamsState((cur) => cur.map((t) => ({ ...t, score: 0 })));
    setHintsUsed([]);
    setMaxTime(filters.timer);
    setTimeLeft(filters.timer);
    setShowHints(false);
    setBuzzed(null);
    setLastWin(null);
    setLastWasCancelled(false);
    setScreen('ready');
    track('game_started', {
      rounds: filters.rounds,
      timer_seconds: filters.timer,
      difficulty: filters.difficulty,
      hints_enabled: filters.hintsOn,
      era_count: filters.eras.length,
      mood_count: filters.moods.length,
    });
  }, [filters]);

  const playRound = useCallback(() => {
    setHintsUsed([]);
    setTimeLeft(filters.timer);
    setMaxTime(filters.timer);
    setBuzzed(null);
    setShowHints(false);
    setLastWasCancelled(false);
    setIsPaused(false);
    setScreen('playing');
  }, [filters.timer]);

  const togglePause = useCallback(() => setIsPaused((p) => !p), []);

  // Reset the round's listen-time budget. Called by the Replay button — the
  // 30s isn't a guess deadline, it's the audio playback window, so when the
  // host replays the clip the budget restarts.
  const resetTimer = useCallback(() => {
    setTimeLeft(maxTime);
  }, [maxTime]);

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
    setTeamsState(newTeams);
    setHistory((h) => [...h, { song, winner: newTeams[teamIdx], points: pts }]);
    setLastWin({ winner: newTeams[teamIdx], points: pts });
    setBuzzed(null);
    setLastWasCancelled(false);
    void markPlayed(song.id);
    setScreen('reveal');
    track('answer_correct', {
      round,
      points: pts,
      hints_used: hintsUsed.length,
      song_era: song.era,
    });
  }, [buzzed, computePoints, hintsUsed.length, markPlayed, round, songDeck, songIdx, teams]);

  const onWrong = useCallback(() => {
    if (buzzed === null) return;
    const teamIdx = buzzed;
    setTeamsState((cur) =>
      cur.map((t, i) => (i === teamIdx ? { ...t, score: Math.max(0, t.score - 10) } : t)),
    );
    setBuzzed(null);
    track('answer_wrong', { round });
  }, [buzzed, round]);

  const finishRoundMiss = useCallback(() => {
    const song = songDeck[songIdx];
    setHistory((h) => [...h, { song, winner: null, points: 0 }]);
    setLastWin(null);
    setLastWasCancelled(false);
    void markPlayed(song.id);
    setScreen('reveal');
    track('round_missed', { round, song_era: song.era });
  }, [markPlayed, round, songDeck, songIdx]);

  // Quit the current game — wipes round/score/history state and returns to
  // Home. Filters and team setup are preserved (those are persisted prefs).
  // Confirmation happens at the UI layer via Alert.
  const quitGame = useCallback(() => {
    track('game_quit', { quit_at_round: round, total_rounds: filters.rounds });
    setRound(1);
    setSongIdx(0);
    setHistory([]);
    setLastWin(null);
    setBuzzed(null);
    setShowHints(false);
    setHintsUsed([]);
    setLastWasCancelled(false);
    setIsPaused(false);
    setTeamsState((cur) => cur.map((t) => ({ ...t, score: 0 })));
    setScreen('home');
  }, [filters.rounds, round]);

  // Cancel current round — reveal the burned song (so everyone learns the
  // answer), keep round number, take no score. Player then taps Continue
  // and the picker swaps in a fresh song under the same round number.
  const cancelRound = useCallback(() => {
    setLastWin(null);
    setLastWasCancelled(true);
    setBuzzed(null);
    setShowHints(false);
    setScreen('reveal');
  }, []);

  // Block a song by ID — never surface it again on this device.
  // Updates the persisted blocklist + the in-memory ref the picker reads.
  const blockSongById = useCallback(async (id: string) => {
    const next = await addToBlocklist(id);
    blockedIdsRef.current = next;
  }, []);

  // Block the current song AND treat the rest like a cancel-round (reveal
  // the burned song, replace under same round, no score). Use when a song
  // is in-game and the host decides "this one's no good for the game."
  const blockCurrentSong = useCallback(() => {
    const song = songDeck[songIdx];
    if (song) void blockSongById(song.id);
    setLastWin(null);
    setLastWasCancelled(true);
    setBuzzed(null);
    setShowHints(false);
    setScreen('reveal');
  }, [blockSongById, songDeck, songIdx]);

  // Continue after a Reveal screen — branches on whether this was a normal
  // round finish (advance to next round) or a cancellation (swap in a fresh
  // song for the same round and replay).
  const nextRound = useCallback(() => {
    if (lastWasCancelled) {
      const currentMovie = songDeck[songIdx]?.movie;
      const replacement = pickReplacement({
        filters,
        recentlyPlayedIds: recentIdsRef.current,
        blockedIds: blockedIdsRef.current,
        extraSongs: userSongsRef.current,
        excludeSongIds: songDeck.map((s) => s.id),
        excludeMovies: currentMovie ? [currentMovie] : [],
      });
      if (replacement) {
        setSongDeck((cur) => cur.map((s, i) => (i === songIdx ? replacement : s)));
      }
      setHintsUsed([]);
      setTimeLeft(filters.timer);
      setMaxTime(filters.timer);
      setBuzzed(null);
      setShowHints(false);
      setLastWasCancelled(false);
      setScreen('playing');
      return;
    }
    if (round >= filters.rounds || songIdx >= songDeck.length - 1) {
      // Track game completion + winner for funnel + retention analysis.
      const maxScore = Math.max(...teams.map((t) => t.score));
      const winnerCount = teams.filter((t) => t.score === maxScore).length;
      track('game_completed', {
        rounds: filters.rounds,
        teams: teams.length,
        winner_score: maxScore,
        tie: winnerCount > 1,
      });
      setScreen('summary');
      return;
    }
    setRound((r) => r + 1);
    setSongIdx((i) => i + 1);
    setLastWin(null);
    setScreen('ready');
  }, [filters, lastWasCancelled, round, songDeck, songIdx, teams]);

  const revealHint = useCallback(
    (key: HintKey) => setHintsUsed((cur) => (cur.includes(key) ? cur : [...cur, key])),
    [],
  );

  const setTeamCount = useCallback(
    (n: 2 | 3 | 4) => setTeamsState(DEFAULT_TEAMS_BY_COUNT[n]),
    [],
  );

  const signOut = useCallback(() => {
    setUser(null);
    setService(null);
    setScreen('splash');
  }, []);

  // Timer tick — only ticks during active playback, not while buzzed / hints
  // overlay open / manually paused.
  useEffect(() => {
    if (screen !== 'playing' || buzzed !== null || showHints || isPaused) return;
    if (timeLeft <= 0) {
      finishRoundMiss();
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [screen, timeLeft, buzzed, showHints, isPaused, finishRoundMiss]);

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
      lastWasCancelled,
      isPaused,
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
      quitGame,
      blockCurrentSong,
      blockSongById,
      refreshUserCatalog,
      togglePause,
      resetTimer,
      nextRound,
      revealHint,
      setShowHints,
      signOut,
    },
  };
}
