import { requireOptionalNativeModule } from 'expo';

export type AuthorizationStatus =
  | 'notDetermined'
  | 'denied'
  | 'restricted'
  | 'authorized';

export type PlaybackState =
  | 'stopped'
  | 'playing'
  | 'paused'
  | 'interrupted'
  | 'seekingForward'
  | 'seekingBackward';

export type CatalogSearchResult = {
  id: string;
  title: string;
  artistName: string;
  albumTitle?: string | null;
  durationSeconds?: number | null;
  artworkUrl?: string | null;
};

type NativeNaamMusic = {
  getAuthorizationStatus(): AuthorizationStatus;
  requestAuthorization(): Promise<AuthorizationStatus>;
  canPlayCatalogContent(): Promise<boolean>;
  searchCatalog(query: string, limit: number): Promise<CatalogSearchResult[]>;
  play(catalogId: string): Promise<void>;
  pause(): Promise<void>;
  stop(): Promise<void>;
  getPlaybackState(): PlaybackState;
};

// Optional so the app still launches on platforms / builds where the
// native module isn't present (Expo Go, Android, debug variants without
// the local module). Every public method below null-checks and falls
// back to a sensible "Apple Music not available" answer.
const native = requireOptionalNativeModule<NativeNaamMusic>('NaamMusicModule');

const unavailable = (): never => {
  throw new Error('Apple Music is not available on this build');
};

export const NaamMusic = {
  isAvailable: (): boolean => native !== null,
  getAuthorizationStatus: (): AuthorizationStatus =>
    native ? native.getAuthorizationStatus() : 'notDetermined',
  requestAuthorization: (): Promise<AuthorizationStatus> =>
    native ? native.requestAuthorization() : Promise.resolve('denied'),
  canPlayCatalogContent: (): Promise<boolean> =>
    native ? native.canPlayCatalogContent() : Promise.resolve(false),
  searchCatalog: (
    query: string,
    limit: number = 5,
  ): Promise<CatalogSearchResult[]> =>
    native ? native.searchCatalog(query, limit) : Promise.resolve([]),
  play: (catalogId: string): Promise<void> =>
    native ? native.play(catalogId) : Promise.reject(unavailable),
  pause: (): Promise<void> => (native ? native.pause() : Promise.resolve()),
  stop: (): Promise<void> => (native ? native.stop() : Promise.resolve()),
  getPlaybackState: (): PlaybackState =>
    native ? native.getPlaybackState() : 'stopped',
};
