import { useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from 'expo-audio';

import type { Song } from '../data/catalog';
import { lookupTrack } from '../services/itunesLookup';

const SILENT_WAV =
  'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

export function useGameAudio(currentSong: Song | null, shouldPlay: boolean) {
  const player = useAudioPlayer(SILENT_WAV);
  const [trackId, setTrackId] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [looking, setLooking] = useState(false);
  const loadedForSongIdRef = useRef<string | null>(null);

  // Look up the preview URL when the song changes
  useEffect(() => {
    if (!currentSong) return;
    if (loadedForSongIdRef.current === currentSong.id) return;

    let cancelled = false;
    setLooking(true);
    setPreviewUrl(null);
    setTrackId(null);

    lookupTrack(currentSong)
      .then((track) => {
        if (cancelled) return;
        loadedForSongIdRef.current = currentSong.id;
        if (track && track.previewUrl) {
          setPreviewUrl(track.previewUrl);
          setTrackId(track.trackId);
          player.replace(track.previewUrl);
        }
      })
      .finally(() => {
        if (!cancelled) setLooking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [currentSong, player]);

  // Play/pause based on shouldPlay
  useEffect(() => {
    if (!previewUrl) return;
    if (shouldPlay) {
      player.play();
    } else {
      player.pause();
    }
  }, [shouldPlay, previewUrl, player]);

  return { trackId, previewUrl, looking };
}
