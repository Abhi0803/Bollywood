// Recently-played song IDs.
//
// Currently in-memory only — clears on app restart. A previous attempt to
// persist via @react-native-async-storage/async-storage hit an upstream
// Metro/Expo-SDK-54 resolution bug in that package (see commit history).
//
// Follow-up: re-add persistence using expo-file-system (a single
// FileSystem.writeAsStringAsync to documentDirectory) once gameplay testing
// is stable. Behaviour for the picker is unchanged — it still avoids repeats
// within the current session, which is enough for a single play night.

const MAX_HISTORY = 60;

export type RecentRecord = { id: string; playedAt: number };

let memory: RecentRecord[] = [];

export async function loadRecent(): Promise<RecentRecord[]> {
  return memory;
}

export async function recordPlay(id: string): Promise<RecentRecord[]> {
  memory = [
    { id, playedAt: Date.now() },
    ...memory.filter((r) => r.id !== id),
  ].slice(0, MAX_HISTORY);
  return memory;
}

export async function clearRecent(): Promise<void> {
  memory = [];
}

export function recentIds(records: RecentRecord[]): string[] {
  return records.map((r) => r.id);
}
