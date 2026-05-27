import { useCallback, useEffect, useState } from 'react';

import {
  NaamMusic,
  type AuthorizationStatus,
} from '../../modules/expo-naam-music';

export type AppleMusicState = {
  status: AuthorizationStatus | 'unknown';
  canPlayFull: boolean;
  checking: boolean;
};

// Single source of truth for "can Apple Music play full songs right now?".
// Used by ConnectScreen (to drive the connect/connected UI) and by
// useGameAudio (to decide whether to play a full track or fall back to the
// expo-audio 30s preview).

export function useAppleMusic(): AppleMusicState & {
  connect: () => Promise<AuthorizationStatus>;
  refresh: () => Promise<void>;
} {
  const [status, setStatus] = useState<AuthorizationStatus | 'unknown'>(
    'unknown',
  );
  const [canPlayFull, setCanPlayFull] = useState(false);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const s = NaamMusic.getAuthorizationStatus();
      setStatus(s);
      if (s === 'authorized') {
        const ok = await NaamMusic.canPlayCatalogContent();
        setCanPlayFull(ok);
      } else {
        setCanPlayFull(false);
      }
    } finally {
      setChecking(false);
    }
  }, []);

  // Triggers the iOS auth prompt (only the FIRST time — subsequent calls
  // return the cached decision; users have to go to Settings → Naam Bolo
  // to change their mind).
  const connect = useCallback(async () => {
    setChecking(true);
    try {
      const next = await NaamMusic.requestAuthorization();
      setStatus(next);
      if (next === 'authorized') {
        const ok = await NaamMusic.canPlayCatalogContent();
        setCanPlayFull(ok);
      } else {
        setCanPlayFull(false);
      }
      return next;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { status, canPlayFull, checking, connect, refresh };
}
