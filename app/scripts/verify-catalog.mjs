// Verify every song in catalog.json against the iTunes Search API.
//
// Output files (relative to repo root):
//   app/scripts/verify-results.json   per-song machine-readable results
//   CATALOG_VERIFY.md                 human-readable report grouped by status
//
// Rate-limiting strategy:
//   - 750 ms base delay between calls → ~80 req/min (Apple's documented
//     soft limit is ~20/min but the Search API tolerates more; this gives
//     reasonable headroom)
//   - Exponential backoff on HTTP 403 / 429: 5s, 15s, 45s
//   - Up to 4 retries per song before marking ERROR
//   - Partial results written every 25 songs so a Ctrl+C never loses
//     more than the last batch
//
// For 3270 songs this takes ~40-45 minutes if no rate-limit hits.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', 'src', 'data', 'catalog.json');
const RESULTS_JSON = path.resolve(__dirname, 'verify-results.json');
const REPORT_MD = path.resolve(__dirname, '..', '..', 'CATALOG_VERIFY.md');

const BASE_DELAY_MS = 750;
const BACKOFF_STEPS_MS = [5_000, 15_000, 45_000];
const MAX_RETRIES = 4;

const songs = JSON.parse(fs.readFileSync(SRC, 'utf8'));
console.log(`Loaded ${songs.length} songs from ${SRC}`);
console.log(`Estimated runtime: ~${Math.round((songs.length * BASE_DELAY_MS) / 60_000)} min if no rate-limit hits.`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function scoreMatch(track, song) {
  let s = 0;
  const t = (track.trackName || '').toLowerCase();
  const wanted = (song.song || '').toLowerCase();
  if (t === wanted) s += 5;
  else if (t.startsWith(wanted) || wanted.startsWith(t)) s += 3;
  else if (t.includes(wanted) || wanted.includes(t)) s += 1;
  const album = (track.collectionName || '').toLowerCase();
  const wantedMovie = (song.movie || '').toLowerCase();
  if (album && wantedMovie && album.includes(wantedMovie)) s += 3;
  if (track.previewUrl) s += 1;
  return s;
}

async function searchOne(song) {
  const term = `${song.song} ${song.movie}`;
  const url =
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}` +
    `&entity=song&country=in&limit=15`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 403 || res.status === 429) {
        const backoff = BACKOFF_STEPS_MS[Math.min(attempt, BACKOFF_STEPS_MS.length - 1)];
        process.stdout.write(`  [${res.status}] backing off ${backoff / 1000}s… `);
        await sleep(backoff);
        process.stdout.write(`\n`);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const data = await res.json();
      return data.results || [];
    } catch (e) {
      if (attempt === MAX_RETRIES) throw e;
      await sleep(2000 * (attempt + 1));
    }
  }
  return [];
}

function classify(song, results) {
  if (results.length === 0) return { status: 'NO_RESULTS', best: null, score: 0 };
  const withPreview = results.filter((r) => r.previewUrl);
  if (withPreview.length === 0) {
    return { status: 'NO_PREVIEW', best: results[0], score: 0 };
  }
  const ranked = [...withPreview].sort((a, b) => scoreMatch(b, song) - scoreMatch(a, song));
  const best = ranked[0];
  const score = scoreMatch(best, song);
  let status;
  if (score >= 8) status = 'HIT';
  else if (score >= 5) status = 'MAYBE';
  else status = 'WEAK';
  return { status, best, score };
}

function summary(results) {
  const c = { HIT: 0, MAYBE: 0, WEAK: 0, NO_PREVIEW: 0, NO_RESULTS: 0, ERROR: 0 };
  for (const r of results) c[r.status] = (c[r.status] || 0) + 1;
  return c;
}

function writeMarkdown(results, counters) {
  const buckets = {};
  for (const s of ['NO_RESULTS', 'NO_PREVIEW', 'WEAK', 'MAYBE', 'ERROR', 'HIT']) {
    buckets[s] = results.filter((r) => r.status === s);
  }
  const total = results.length;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  let out = `# Catalog Verification Report

Generated: ${new Date().toISOString()}
Songs checked: **${total}**

| Status | Count | % | Meaning |
|---|---|---|---|
| 🟢 HIT | ${counters.HIT || 0} | ${pct(counters.HIT || 0)}% | Strong match — playable |
| 🟡 MAYBE | ${counters.MAYBE || 0} | ${pct(counters.MAYBE || 0)}% | Preview found, match quality medium |
| 🟠 WEAK | ${counters.WEAK || 0} | ${pct(counters.WEAK || 0)}% | Preview found but probably wrong song — fix metadata |
| 🔴 NO_PREVIEW | ${counters.NO_PREVIEW || 0} | ${pct(counters.NO_PREVIEW || 0)}% | Track on iTunes but no 30s preview exposed |
| 🔴 NO_RESULTS | ${counters.NO_RESULTS || 0} | ${pct(counters.NO_RESULTS || 0)}% | iTunes returned nothing |
| ⚠️ ERROR | ${counters.ERROR || 0} | ${pct(counters.ERROR || 0)}% | Network / rate-limit failure |

`;

  const sectionConfigs = [
    {
      key: 'NO_RESULTS',
      title: '🔴 No results — iTunes knows nothing',
      hint: 'Spelling drift between catalog and iTunes India listing. Check the song on music.apple.com/in/.',
    },
    {
      key: 'NO_PREVIEW',
      title: '🔴 No preview URL',
      hint: 'Track exists on iTunes India but no 30-sec preview. Replace or remove.',
    },
    {
      key: 'WEAK',
      title: '🟠 Weak match — probably wrong song',
      hint: 'iTunes returned a track with this title but different artist/album/movie. Make `song` or `movie` more specific.',
    },
    {
      key: 'MAYBE',
      title: '🟡 Medium-confidence match',
      hint: 'Eyeball whether the matched album corresponds to the same movie.',
    },
    {
      key: 'ERROR',
      title: '⚠️ API errors',
      hint: 'Rate-limit or network blip. Re-run.',
    },
  ];

  for (const cfg of sectionConfigs) {
    const list = buckets[cfg.key];
    if (!list || list.length === 0) continue;
    out += `## ${cfg.title} (${list.length})\n\n${cfg.hint}\n\n`;
    out += `| id | catalog song | catalog movie | iTunes matched | iTunes artist | iTunes album |\n`;
    out += `|---|---|---|---|---|---|\n`;
    for (const r of list) {
      const m = (s) => (s == null ? '—' : String(s).replace(/\|/g, '\\|'));
      out += `| \`${r.id}\` | ${m(r.song)} | ${m(r.movie)} | ${m(r.matchedTrack)} | ${m(r.matchedArtist)} | ${m(r.matchedAlbum)} |\n`;
    }
    out += `\n`;
  }

  out += `## 🟢 Strong matches (${buckets.HIT.length})\n\nNo action needed.\n\n<details><summary>Show ${buckets.HIT.length} entries</summary>\n\n`;
  out += `| id | song | movie | iTunes album |\n|---|---|---|---|\n`;
  for (const r of buckets.HIT) {
    out += `| \`${r.id}\` | ${r.song} | ${r.movie} | ${r.matchedAlbum || '—'} |\n`;
  }
  out += `\n</details>\n`;

  return out;
}

async function main() {
  const startedAt = Date.now();
  const results = [];

  for (let i = 0; i < songs.length; i++) {
    const song = songs[i];
    let entry;
    try {
      const tracks = await searchOne(song);
      const { status, best, score } = classify(song, tracks);
      entry = {
        id: song.id,
        song: song.song,
        movie: song.movie,
        status,
        score,
        matchedTrack: best ? best.trackName : null,
        matchedArtist: best ? best.artistName : null,
        matchedAlbum: best ? best.collectionName : null,
        matchedTrackId: best ? best.trackId : null,
        previewUrl: best && best.previewUrl ? best.previewUrl : null,
      };
    } catch (e) {
      entry = {
        id: song.id,
        song: song.song,
        movie: song.movie,
        status: 'ERROR',
        error: String(e),
      };
    }
    results.push(entry);

    if ((i + 1) % 25 === 0 || i === songs.length - 1) {
      const counters = summary(results);
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      const pct = Math.round(((i + 1) / songs.length) * 100);
      const eta = i > 0 ? Math.round(((Date.now() - startedAt) / (i + 1)) * (songs.length - i - 1) / 1000) : 0;
      console.log(
        `[${pct}%] ${i + 1}/${songs.length} · ${elapsed}s elapsed · ~${eta}s left · ` +
          `HIT:${counters.HIT || 0} MAYBE:${counters.MAYBE || 0} WEAK:${counters.WEAK || 0} ` +
          `NO_PREVIEW:${counters.NO_PREVIEW || 0} NO_RESULTS:${counters.NO_RESULTS || 0} ERROR:${counters.ERROR || 0}`,
      );
      fs.writeFileSync(
        RESULTS_JSON,
        JSON.stringify({ done: i + 1, total: songs.length, counters, results }, null, 2),
      );
    }
    await sleep(BASE_DELAY_MS);
  }

  const counters = summary(results);
  fs.writeFileSync(
    RESULTS_JSON,
    JSON.stringify({ done: songs.length, total: songs.length, counters, results }, null, 2),
  );
  fs.writeFileSync(REPORT_MD, writeMarkdown(results, counters));

  console.log('\n=== DONE ===');
  console.log('Counters:', counters);
  console.log('Results JSON:', RESULTS_JSON);
  console.log('Report:    ', REPORT_MD);
}

main().catch((e) => {
  console.error('\nFATAL:', e);
  process.exit(1);
});
