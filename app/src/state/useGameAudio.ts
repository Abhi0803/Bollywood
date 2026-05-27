import { useCallback, useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';

import type { Song } from '../data/catalog';
import { NaamMusic } from '../../modules/expo-naam-music';
import { lookupTrack } from '../services/itunesLookup';
import { findAppleMusicId } from '../services/appleMusicLookup';
import { track as trackEvent } from '../lib/posthog';

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
// Apple Music branch (added with NaamMusicModule):
//   - When `useAppleMusic` is true AND the song resolves to an Apple Music
//     catalog ID, we play the FULL song via ApplicationMusicPlayer.
//   - Otherwise we fall back to the existing iTunes preview path.
//   - iTunes lookup still happens regardless (the Reveal screen's "Open in
//     Apple Music" link uses the iTunes track ID).

type PlaybackMode = 'idle' | 'preview' | 'apple-music';

export function useGameAudio(
  currentSong: Song | null,
  shouldPlay: boolean,
  useAppleMusic: boolean = false,
) {
  const player = useAudioPlayer(SILENT_WAV);
  const [trackId, setTrackId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [appleId, setAppleId] = useState<string | null>(null);
  const [mode, setMode] = useState<PlaybackMode>('idle');
  const [looking, setLooking] = useState(false);

  // Tracks "which song's playback is currently loaded." The play effect
  // refuses to start playback unless this matches currentSong.id.
  const loadedForSongIdRef = useRef<string | null>(null);
  // Monotonic counter so we can identify and discard stale lookup responses.
  const lookupGenRef = useRef(0);

  // Look up the preview URL + (optionally) Apple Music catalog ID when
  // the song changes.
  useEffect(() => {
    if (!currentSong) return;
    if (loadedForSongIdRef.current === currentSong.id) return;

    const myGen = ++lookupGenRef.current;

    // Hard reset BOTH audio engines so the previous song can't bleed in.
    player.pause();
    player.replace(SILENT_WAV);
    void NaamMusic.stop().catch(() => {});

    setPreviewUrl(null);
    setTrackId(null);
    setAppleId(null);
    setMode('idle');
    setLooking(true);

    const itunesPromise = lookupTrack(currentSong);
    const applePromise = useAppleMusic
      ? findAppleMusicId(currentSong)
      : Promise.resolve(null);

    Promise.all([itunesPromise, applePromise])
      .then(([track, foundAppleId]) => {
        if (myGen !== lookupGenRef.current) return; // a newer lookup took over

        if (track && track.previewUrl) {
          player.replace(track.previewUrl);
          setPreviewUrl(track.previewUrl);
          setTrackId(track.trackId);
        }
        setAppleId(foundAppleId);

        if (foundAppleId) {
          setMode('apple-music');
        } else if (track && track.previewUrl) {
          setMode('preview');
        } else {
          setMode('idle');
        }

        loadedForSongIdRef.current = currentSong.id;
      })
      .finally(() => {
        if (myGen === lookupGenRef.current) setLooking(false);
      });
  }, [currentSong, player, useAppleMusic]);

  // Play/pause based on shouldPlay. Branches between Apple Music and
  // expo-audio preview based on what was resolved for this song.
  useEffect(() => {
    if (!currentSong) return;
    if (loadedForSongIdRef.current !== currentSong.id) return;

    if (shouldPlay) {
      if (mode === 'apple-music' && appleId) {
        trackEvent('audio_play_started', { source: 'apple-music', song_id: currentSong.id });
        void NaamMusic.play(appleId).catch((err) => {
          trackEvent('apple_music_play_failed', {
            song_id: currentSong.id,
            error: String(err?.message ?? err),
          });
          if (previewUrl) {
            setMode('preview');
            player.play();
          }
        });
      } else if (mode === 'preview' && previewUrl) {
        trackEvent('audio_play_started', { source: 'preview', song_id: currentSong.id });
        player.play();
      }
    } else {
      if (mode === 'apple-music') {
        void NaamMusic.pause().catch(() => {});
      } else {
        player.pause();
      }
    }
  }, [shouldPlay, mode, appleId, previewUrl, currentSong, player]);

  // Replay clip — same gating as the play effect.
  const replay = useCallback(() => {
    if (!currentSong) return;
    if (loadedForSongIdRef.current !== currentSong.id) return;
    if (mode === 'apple-music' && appleId) {
      void NaamMusic.play(appleId).catch(() => {});
    } else if (mode === 'preview' && previewUrl) {
      player.seekTo(0);
      player.play();
    }
  }, [player, previewUrl, currentSong, mode, appleId]);

  return { trackId, previewUrl, looking, replay };
}
