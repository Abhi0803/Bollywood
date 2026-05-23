// Per-device user catalog — songs the player has added themselves via
// the AddSong screen. Stored separately from the bundled catalog.json so
// updates to the app don't blow away user additions.
//
// The picker is fed the union (bundled SONGS ∪ user catalog) from
// useGameState; user-added entries get unique IDs prefixed with "u" so
// they never collide with bundled "s" IDs.
//
// Persisted via expo-file-system. Best-effort; failures swallowed.

import { File, Paths } from 'expo-file-system';

import type { Song } from '../data/catalog';

const FILE_NAME = 'naam-bolo-user-catalog-v1.json';

function getFile(): File {
  return new File(Paths.document, FILE_NAME);
}

export async function loadUserCatalog(): Promise<Song[]> {
  try {
    const file = getFile();
    if (!file.exists) return [];
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];
    // Light validation — drop entries missing required string fields.
    return parsed.filter(
      (s): s is Song =>
        s && typeof s.id === 'string' && typeof s.song === 'string' && typeof s.movie === 'string',
    );
  } catch {
    return [];
  }
}

function nextUserId(existing: Song[]): string {
  let max = 0;
  for (const s of existing) {
    const m = String(s.id).match(/^u(\d+)$/);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `u${max + 1}`;
}

export async function addUserSong(partial: Omit<Song, 'id'>): Promise<Song[]> {
  try {
    const current = await loadUserCatalog();
    const next: Song[] = [...current, { ...partial, id: nextUserId(current) }];
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function removeUserSong(id: string): Promise<Song[]> {
  try {
    const current = await loadUserCatalog();
    const next = current.filter((s) => s.id !== id);
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function clearUserCatalog(): Promise<void> {
  try {
    const file = getFile();
    if (file.exists) file.delete();
  } catch {
    // ignore
  }
}
