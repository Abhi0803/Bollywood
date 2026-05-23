// Verify every song in catalog.json against the iTunes Search API using
// EXACTLY the same fuzzy lookup the runtime uses (see
// src/services/itunesLookup.ts). Each entry classified as:
//
//   HIT    — runtime lookup will return a valid preview URL → plays cleanly
//   SILENT — runtime lookup will return null → round runs out without audio
//
// SILENT covers everything bad: no iTunes results, no preview URL, and
// matches that fall under the confidence threshold (which the runtime
// would refuse to play to avoid audio-vs-metadata mismatch).
//
// Output files (relative to repo root):
//   app/scripts/verify-results.json   per-song results
//   CATALOG_VERIFY.md                 human-readable report

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
const SCORE_THRESHOLD = 5;

const songs = JSON.parse(fs.readFileSync(SRC, 'utf8'));
console.log(`Loaded ${songs.length} songs from ${SRC}`);
console.log(
  `Estimated runtime: ~${Math.round((songs.length * BASE_DELAY_MS * 1.4) / 60_000)} min ` +
    `(extra 40% for noise-strip retries on subset of songs).`,
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Mirror of src/services/itunesLookup.ts ────────────────────────────────
const NOISE_PATTERNS = [
  /\(\s*(reprise[d]?|unplugged|remix|extended|short version|long version|club mix|rock version|female version|male version|instrumental|cover|version)\s*\)/gi,
  /\b(reprise[d]?|unplugged|remix|extended|club mix|rock version|female version|male version|instrumental)\b/gi,
];
function stripNoise(t) {
  let o = t;
  for (const p of NOISE_PATTERNS) o = o.replace(p, ' ');
  return o.replace(/\s+/g, ' ').trim();
}

function normalize(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function editDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    const cur = new Array(n + 1);
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      cur[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j - 1], prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[n];
}

function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) {
    const ratio = Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    if (ratio >= 0.5) return Math.max(ratio, 0.8);
  }
  const maxLen = Math.max(na.length, nb.length);
  return Math.max(0, 1 - editDistance(na, nb) / maxLen);
}

function albumMatchesMovie(album, movie) {
  if (!album || !movie) return false;
  if (album.toLowerCase().includes(movie.toLowerCase())) return true;
  const stripped = album.replace(/\([^)]*\)/g, '').trim();
  return similarity(stripped, movie) >= 0.85;
}

function scoreMatch(track, song) {
  let s = 0;
  const sim = similarity(track.trackName || '', song.song);
  if (sim >= 0.8) s += 5;
  else if (sim >= 0.55) s += 3;
  else if (sim >= 0.3) s += 1;
  if (albumMatchesMovie(track.collectionName || '', song.movie)) s += 3;
  if (track.previewUrl) s += 1;
  return s;
}

function pickBest(results, song) {
  const withPreview = (results || []).filter((r) => r.previewUrl);
  if (withPreview.length === 0) return { track: null, score: 0 };
  const ranked = [...withPreview].sort(
    (a, b) => scoreMatch(b, song) - scoreMatch(a, song),
  );
  return { track: ranked[0], score: scoreMatch(ranked[0], song) };
}

async function searchITunes(term) {
  const url =
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}` +
    `&entity=song&country=in&limit=15`;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 403 || res.status === 429) {
        const backoff = BACKOFF_STEPS_MS[Math.min(attempt, BACKOFF_STEPS_MS.length - 1)];
        process.stdout.write(`  [${res.status}] backoff ${backoff / 1000}s… `);
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

// Full lookup matching the runtime logic. May make 1 or 2 iTunes calls.
async function lookup(song) {
  let { track, score } = pickBest(
    await searchITunes(`${song.song} ${song.movie}`),
    song,
  );
  let retried = false;
  if (!track || score < SCORE_THRESHOLD) {
    const cleaned = stripNoise(song.song);
    if (cleaned && normalize(cleaned) !== normalize(song.song)) {
      retried = true;
      await sleep(BASE_DELAY_MS); // throttle the retry call too
      const retry = pickBest(await searchITunes(`${cleaned} ${song.movie}`), song);
      if (retry.track && retry.score > score) {
        track = retry.track;
        score = retry.score;
      }
    }
  }
  return { track, score, retried };
}

function summary(results) {
  const c = { HIT: 0, SILENT: 0, ERROR: 0, RETRIED: 0 };
  for (const r of results) {
    c[r.status] = (c[r.status] || 0) + 1;
    if (r.retried) c.RETRIED++;
  }
  return c;
}

function writeMarkdown(results, counters) {
  const total = results.length;
  const pct = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);
  const silent = results.filter((r) => r.status === 'SILENT');
  const errors = results.filter((r) => r.status === 'ERROR');
  const hits = results.filter((r) => r.status === 'HIT');

  let out = `# Catalog Verification Report

Generated: ${new Date().toISOString()}
Songs checked: **${total}**

| Status | Count | % | Meaning |
|---|---|---|---|
| 🟢 HIT | ${counters.HIT || 0} | ${pct(counters.HIT || 0)}% | App plays a high-confidence match |
| 🔴 SILENT | ${counters.SILENT || 0} | ${pct(counters.SILENT || 0)}% | App returns null (silent round) — pruned |
| ⚠️ ERROR | ${counters.ERROR || 0} | ${pct(counters.ERROR || 0)}% | Network / rate-limit failure |

${counters.RETRIED ? `\nNoise-strip retry triggered on **${counters.RETRIED}** entries (reprise/remix etc).\n` : ''}
`;

  if (silent.length > 0) {
    out += `\n## 🔴 SILENT — pruned from catalog (${silent.length})\n\n`;
    out += `These were removed from catalog.json. Recover them in the curator (http://localhost:7878) by searching iTunes for the right spelling.\n\n`;
    out += `| id | catalog song | catalog movie | iTunes best guess (rejected) |\n`;
    out += `|---|---|---|---|\n`;
    for (const r of silent) {
      const m = (s) => (s == null ? '—' : String(s).replace(/\|/g, '\\|'));
      const guess = r.matchedTrack
        ? `${m(r.matchedTrack)} · ${m(r.matchedArtist)} · ${m(r.matchedAlbum)} (score ${r.score})`
        : 'no results';
      out += `| \`${r.id}\` | ${m(r.song)} | ${m(r.movie)} | ${guess} |\n`;
    }
  }
  if (errors.length > 0) {
    out += `\n## ⚠️ ERROR (${errors.length})\n\nRe-run the script.\n\n`;
  }
  out += `\n## 🟢 HIT (${hits.length})\n\nNo action — these play cleanly.\n\n<details><summary>Show ${hits.length} entries</summary>\n\n`;
  out += `| id | song | movie | matched album |\n|---|---|---|---|\n`;
  for (const r of hits) {
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
      const { track, score, retried } = await lookup(song);
      entry = {
        id: song.id,
        song: song.song,
        movie: song.movie,
        status: track ? 'HIT' : 'SILENT',
        score,
        retried,
        matchedTrack: track ? track.trackName : null,
        matchedArtist: track ? track.artistName : null,
        matchedAlbum: track ? track.collectionName : null,
        matchedTrackId: track ? track.trackId : null,
        previewUrl: track && track.previewUrl ? track.previewUrl : null,
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
      const c = summary(results);
      const elapsed = Math.round((Date.now() - startedAt) / 1000);
      const eta = i > 0 ? Math.round(((Date.now() - startedAt) / (i + 1)) * (songs.length - i - 1) / 1000) : 0;
      const pct = Math.round(((i + 1) / songs.length) * 100);
      console.log(
        `[${pct}%] ${i + 1}/${songs.length} · ${elapsed}s elapsed · ~${eta}s left · ` +
          `HIT:${c.HIT || 0} SILENT:${c.SILENT || 0} ERROR:${c.ERROR || 0} (retries:${c.RETRIED || 0})`,
      );
      fs.writeFileSync(
        RESULTS_JSON,
        JSON.stringify({ done: i + 1, total: songs.length, counters: c, results }, null, 2),
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
}

main().catch((e) => {
  console.error('\nFATAL:', e);
  process.exit(1);
});
