// Apple Music affiliate-link helper.
// If you have an iTunes Affiliate token (PHG / Apple Services Performance Partners),
// set EXPO_PUBLIC_APPLE_AFFILIATE_TOKEN — links will then earn commission.
// Without it the link still works, you just don't earn the affiliate cut.

const TOKEN = process.env.EXPO_PUBLIC_APPLE_AFFILIATE_TOKEN ?? '';
const CAMPAIGN = 'naam-bolo';

export function appleMusicSongLink(trackId: number, country = 'in'): string {
  const base = `https://music.apple.com/${country}/song/${trackId}`;
  const params = new URLSearchParams();
  params.set('app', 'music');
  if (TOKEN) params.set('at', TOKEN);
  params.set('ct', CAMPAIGN);
  return `${base}?${params.toString()}`;
}

export function appleMusicAlbumLink(collectionId: number, country = 'in'): string {
  const base = `https://music.apple.com/${country}/album/${collectionId}`;
  const params = new URLSearchParams();
  params.set('app', 'music');
  if (TOKEN) params.set('at', TOKEN);
  params.set('ct', CAMPAIGN);
  return `${base}?${params.toString()}`;
}
