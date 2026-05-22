import { searchSongs, type ITunesTrack } from './itunesApi';
import type { Song } from '../data/catalog';

const cache = new Map<string, ITunesTrack | null>();

function keyFor(s: Song): string {
  return `${s.id}::${s.song}::${s.movie}`;
}

function scoreMatch(track: ITunesTrack, song: Song): number {
  let s = 0;
  const t = track.trackName.toLowerCase();
  const wanted = song.song.toLowerCase();
  if (t === wanted) s += 5;
  else if (t.startsWith(wanted) || wanted.startsWith(t)) s += 3;
  else if (t.includes(wanted) || wanted.includes(t)) s += 1;
  const album = (track.collectionName ?? '').toLowerCase();
  if (album.includes(song.movie.toLowerCase())) s += 3;
  if (track.previewUrl) s += 1;
  return s;
}

export async function lookupTrack(song: Song): Promise<ITunesTrack | null> {
  const key = keyFor(song);
  if (cache.has(key)) return cache.get(key) ?? null;

  const term = `${song.song} ${song.movie}`;
  try {
    const results = await searchSongs(term, { limit: 15 });
    if (results.length === 0) {
      cache.set(key, null);
      return null;
    }
    const ranked = [...results].sort((a, b) => scoreMatch(b, song) - scoreMatch(a, song));
    const best = ranked[0];
    cache.set(key, best);
    return best;
  } catch {
    cache.set(key, null);
    return null;
  }
}
