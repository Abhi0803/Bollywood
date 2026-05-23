// Persists recently-played song IDs across game sessions so the picker can
// avoid them. All failures are swallowed — storage is best-effort.

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'naam-bolo:recent-songs:v1';
const MAX_HISTORY = 60; // remember last 60 plays; older ones rotate out

export type RecentRecord = { id: string; playedAt: number };

export async function loadRecent(): Promise<RecentRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function recordPlay(id: string): Promise<RecentRecord[]> {
  try {
    const existing = await loadRecent();
    const next: RecentRecord[] = [
      { id, playedAt: Date.now() },
      ...existing.filter((r) => r.id !== id),
    ].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function clearRecent(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function recentIds(records: RecentRecord[]): string[] {
  return records.map((r) => r.id);
}
