// Persisted user preferences — teams setup, filter selections, current
// signed-in user, and music service. Survives app restarts. Lives in the
// same documentDirectory as recent-songs history, separate file.
//
// Best-effort: storage failures swallowed, so an unwritable FS just means
// the user re-sees defaults next launch (no crash).
//
// NOTE: this currently stores the mocked-login user (just name + email
// fields, no auth token). When we wire Supabase auth, the supabase-js
// client manages its own session storage — at that point this file's
// `user` field becomes a cached display copy rather than the source of
// truth.

import { File, Paths } from 'expo-file-system';

import type { Team } from '../data/teams';
import type { Filters, MusicService, User } from './types';

const FILE_NAME = 'naam-bolo-prefs-v1.json';

export type Preferences = {
  teams?: Team[];
  filters?: Filters;
  user?: User | null;
  service?: MusicService | null;
};

function getFile(): File {
  return new File(Paths.document, FILE_NAME);
}

export async function loadPreferences(): Promise<Preferences> {
  try {
    const file = getFile();
    if (!file.exists) return {};
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed as Preferences;
  } catch {
    return {};
  }
}

export async function savePreferences(patch: Preferences): Promise<void> {
  try {
    const existing = await loadPreferences();
    // Reset scores when persisting teams — scores belong to a single game.
    const teamsToSave = patch.teams
      ? patch.teams.map((t) => ({ ...t, score: 0 }))
      : existing.teams;
    const next: Preferences = {
      ...existing,
      ...patch,
      teams: teamsToSave,
    };
    const file = getFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify(next));
  } catch {
    // best-effort; ignore
  }
}
