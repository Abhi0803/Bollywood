import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';

import type { Song } from '../data/catalog';
import { lookupTrack } from '../services/itunesLookup';

// 1-frame silent WAV — used as the "neutral" source so the player never
// holds a stale preview URL while we're between songs.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

// Reasons the old audio could bleed across song boundaries (the bug we hit):
//   - On a cancel/block → continue flow, songDeck[songIdx] swaps AND the
//     screen transitions Reveal → Playing in the same React batch.
//   - React runs effects in declaration order. The shouldPlay effect can fire
//     player.play() BEFORE the lookup effect has updated previewUrl, because
//     setState is async — the effect sees the previous render's previewUrl.
//   - Result: ~1 second of the old song plays while the new one is being
//     looked up. If a player buzzes in that window, the Reveal answer
//     doesn't match what they heard.
//
// Fixes applied below:
//   1. On any song change, IMMEDIATELY pause + load the silent WAV, so a
//      stray play() can't play the previous preview.
//   2. Bump a monotonic generation counter so out-of-order iTunes lookup
//      responses can't overwrite the current song's metadata.
//   3. Gate the play effect on loadedForSongIdRef matching currentSong — we
//      only ever play audio that was loaded for the song currently on screen.

export function useGameAudio(currentSong: Song | null, shouldPlay: boolean) {
  const player = useAudioPlayer(SILENT_WAV);
  const [trackId, setTrackId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);

  // Tracks "which song's preview is currently loaded into the player." The
  // play effect refuses to start playback unless this matches currentSong.id.
  const loadedForSongIdRef = useRef<string | null>(null);
  // Monotonic counter so we can identify and discard stale lookup responses.
  const lookupGenRef = useRef(0);

  // Look up the preview URL when the song changes.
  useEffect(() => {
    if (!currentSong) return;
    if (loadedForSongIdRef.current === currentSong.id) return;

    const myGen = ++lookupGenRef.current;

    // Hard reset the audio engine FIRST so the previous song's preview can't
    // bleed into the new song's round.
    player.pause();
    player.replace(SILENT_WAV);

    setPreviewUrl(null);
    setTrackId(null);
    setLooking(true);

    lookupTrack(currentSong)
      .then((track) => {
        if (myGen !== lookupGenRef.current) return; // a newer lookup took over
        if (track && track.previewUrl) {
          player.replace(track.previewUrl);
          loadedForSongIdRef.current = currentSong.id;
          setPreviewUrl(track.previewUrl);
          setTrackId(track.trackId);
        } else {
          // No preview found — leave the player on silent so the round just
          // runs out instead of accidentally playing the previous song.
          loadedForSongIdRef.current = currentSong.id;
        }
      })
      .finally(() => {
        if (myGen === lookupGenRef.current) setLooking(false);
      });
  }, [currentSong, player]);

  // Play/pause based on shouldPlay. We deliberately also check that the
  // currently-loaded preview is for currentSong; otherwise we'd start the
  // previous song's preview before the new lookup finishes.
  useEffect(() => {
    if (!currentSong) return;
    if (!previewUrl) return;
    if (loadedForSongIdRef.current !== currentSong.id) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, previewUrl, currentSong, player]);

  // Seek to start and play — for the "Replay clip" button. Same gating as
  // the play effect so we never replay the previous song.
  const replay = useCallback(() => {
    if (!currentSong) return;
    if (!previewUrl) return;
    if (loadedForSongIdRef.current !== currentSong.id) return;
    player.seekTo(0);
    player.play();
  }, [player, previewUrl, currentSong]);

  return { trackId, previewUrl, looking, replay };
}
