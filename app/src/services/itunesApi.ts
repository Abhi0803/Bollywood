export type ITunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionId?: number;
  collectionName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
  trackViewUrl?: string;
  collectionViewUrl?: string;
  releaseDate?: string;
  primaryGenreName?: string;
  trackTimeMillis?: number;
};

type RawResponse = {
  resultCount: number;
  results: ITunesTrack[];
};

const ENDPOINT = 'https://itunes.apple.com/search';

export async function searchSongs(
  term: string,
  opts: { country?: string; limit?: number } = {},
): Promise<ITunesTrack[]> {
  const country = opts.country ?? 'in';
  const limit = opts.limit ?? 10;
  const url =
    `${ENDPOINT}?term=${encodeURIComponent(term)}` +
    `&entity=song&country=${country}&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`iTunes search failed: ${res.status} ${res.statusText}`);
  }
  const data: RawResponse = await res.json();
  return data.results.filter((t) => !!t.previewUrl);
}
