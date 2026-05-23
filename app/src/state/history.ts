// Recently-played song IDs, persisted to the app's document directory via
// expo-file-system's File/Paths API. Survives app restarts on iOS and Android,
// and ships unchanged into TestFlight / App Store builds.
//
// All filesystem failures are swallowed — storage is best-effort. If the file
// is corrupted or the FS denies write, the picker just sees an empty history
// (so a song might repeat a little earlier than it would otherwise).

import { File, Paths } from 'expo-file-system';

const FILE_NAME = 'naam-bolo-recent-v1.json';
const MAX_HISTORY = 60;

export type RecentRecord = { id: string; playedAt: number };

function getFile(): File {
  return new File(Paths.document, FILE_NAME);
}

export async function loadRecent(): Promise<RecentRecord[]> {
  try {
    const file = getFile();
    if (!file.exists) return [];
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (r): r is RecentRecord =>
        r && typeof r.id === 'string' && typeof r.playedAt === 'number',
    );
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

    const file = getFile();
    if (!file.exists) {
      file.create();
    }
    file.write(JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function clearRecent(): Promise<void> {
  try {
    const file = getFile();
    if (file.exists) file.delete();
  } catch {
    // ignore
  }
}

export function recentIds(records: RecentRecord[]): string[] {
  return records.map((r) => r.id);
}
