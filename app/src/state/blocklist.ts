// Per-device song blocklist — IDs the player has marked "too obscure" or
// "30s isn't enough" during a round. The picker filters these out forever
// (or until the user manually clears the blocklist).
//
// Persisted to documentDirectory via expo-file-system. Same pattern as
// history.ts / preferences.ts. Best-effort: failures swallowed.
//
// Note: this is per-device, not synced to the bundled catalog.json. If you
// want to remove a song from the master catalog for everyone, use the
// catalog curator at tools/catalog-curator/.

import { File, Paths } from 'expo-file-system';

const FILE_NAME = 'naam-bolo-blocked-v1.json';

function getFile(): File {
  return new File(Paths.document, FILE_NAME);
}

export async function loadBlocklist(): Promise<string[]> {
  try {
    const file = getFile();
    if (!file.exists) return [];
    const text = await file.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export async function addToBlocklist(id: string): Promise<string[]> {
  try {
    const current = await loadBlocklist();
    if (current.includes(id)) return current;
    const next = [...current, id];
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function removeFromBlocklist(id: string): Promise<string[]> {
  try {
    const current = await loadBlocklist();
    const next = current.filter((x) => x !== id);
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(next));
    return next;
  } catch {
    return [];
  }
}

export async function clearBlocklist(): Promise<void> {
  try {
    const file = getFile();
    if (file.exists) file.delete();
  } catch {
    // ignore
  }
}
