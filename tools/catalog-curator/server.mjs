// Naam Bolo Catalog Curator — tiny Node HTTP server that serves a single-
// page web UI for fixing NO_RESULTS (re-adding pruned songs) and WEAK
// matches (replacing wrong-recording metadata).
//
// Reads/writes:
//   app/src/data/catalog.json                  ← live catalog (auto-backup before each write)
//   app/_catalog-backups/catalog-pre-prune.json ← pool of removed songs
//   app/scripts/verify-results.json            ← verification report
//   tools/catalog-curator/.reviewed.json       ← which IDs the user has processed
//
// Run:
//   node tools/catalog-curator/server.mjs
// Open:
//   http://localhost:7878

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');

const PATHS = {
  catalog: path.join(REPO, 'app', 'src', 'data', 'catalog.json'),
  prePrune: path.join(REPO, 'app', '_catalog-backups', 'catalog-pre-prune.json'),
  verify: path.join(REPO, 'app', 'scripts', 'verify-results.json'),
  backupDir: path.join(REPO, 'app', '_catalog-backups'),
  reviewed: path.join(__dirname, '.reviewed.json'),
  html: path.join(__dirname, 'index.html'),
};

const PORT = 7878;

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
}

function backupCatalog() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = path.join(PATHS.backupDir, `catalog-${stamp}.json`);
  fs.copyFileSync(PATHS.catalog, dest);
  return dest;
}

function loadReviewed() {
  try {
    return new Set(readJson(PATHS.reviewed));
  } catch {
    return new Set();
  }
}

function saveReviewed(set) {
  writeJson(PATHS.reviewed, [...set]);
}

function nextCatalogId(catalog) {
  let maxN = 0;
  for (const s of catalog) {
    const m = String(s.id || '').match(/^s(\d+)$/);
    if (m) maxN = Math.max(maxN, Number(m[1]));
  }
  return `s${maxN + 1}`;
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendText(res, status, body, type = 'text/plain') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    if (route === 'GET /' || route === 'GET /index.html') {
      const html = fs.readFileSync(PATHS.html, 'utf8');
      return sendText(res, 200, html, 'text/html; charset=utf-8');
    }

    if (route === 'GET /api/state') {
      const catalog = readJson(PATHS.catalog);
      const verify = readJson(PATHS.verify);
      const prePrune = fs.existsSync(PATHS.prePrune) ? readJson(PATHS.prePrune) : [];
      const reviewed = [...loadReviewed()];

      // Recover pool = songs in the pre-prune backup that are NOT in the
      // current catalog. Matched by song+movie signature only — IDs get
      // renumbered after every prune so they can't be trusted across the
      // backup/current divide.
      const catalogByKey = new Map();
      for (const s of catalog) {
        const key = `${s.song.toLowerCase().trim()}|${s.movie.toLowerCase().trim()}`;
        catalogByKey.set(key, s.id);
      }
      const noResults = prePrune.filter((s) => {
        const k = `${s.song.toLowerCase().trim()}|${s.movie.toLowerCase().trim()}`;
        return !catalogByKey.has(k);
      });

      // Weak pool = catalog entries the verifier matched with a low-confidence
      // score (still passes the runtime threshold of 5 but worth eyeballing).
      // Mapped via song+movie sig so renumbered IDs still resolve.
      const SCORE_REVIEW_FLOOR = 5;
      const SCORE_REVIEW_CEIL = 6;
      const weakEntries = (verify.results || [])
        .filter(
          (r) =>
            typeof r.score === 'number' &&
            r.score >= SCORE_REVIEW_FLOOR &&
            r.score <= SCORE_REVIEW_CEIL,
        )
        .map((r) => {
          const key = `${(r.song || '').toLowerCase().trim()}|${(r.movie || '').toLowerCase().trim()}`;
          const currentId = catalogByKey.get(key);
          if (!currentId) return null;
          return { ...r, id: currentId };
        })
        .filter(Boolean);

      return sendJson(res, 200, {
        counts: {
          catalog: catalog.length,
          noResults: noResults.length,
          weak: weakEntries.length,
          reviewed: reviewed.length,
        },
        noResults,
        weak: weakEntries,
        reviewed,
      });
    }

    if (route === 'POST /api/reviewed') {
      const body = await readBody(req);
      if (!body.id) return sendJson(res, 400, { error: 'missing id' });
      const set = loadReviewed();
      set.add(body.id);
      saveReviewed(set);
      return sendJson(res, 200, { ok: true });
    }

    if (route === 'POST /api/unreviewed') {
      const body = await readBody(req);
      if (!body.id) return sendJson(res, 400, { error: 'missing id' });
      const set = loadReviewed();
      set.delete(body.id);
      saveReviewed(set);
      return sendJson(res, 200, { ok: true });
    }

    if (route === 'POST /api/catalog/add') {
      // Body: { original: {...}, replacement: { song, movie, year } }
      // original is the pre-prune entry; replacement is the chosen iTunes track.
      const body = await readBody(req);
      const { original, replacement } = body;
      if (!original || !replacement) {
        return sendJson(res, 400, { error: 'missing original or replacement' });
      }
      backupCatalog();
      const catalog = readJson(PATHS.catalog);
      const newEntry = {
        ...original,
        id: nextCatalogId(catalog),
        song: replacement.song || original.song,
        movie: replacement.movie || original.movie,
        year: replacement.year || original.year,
      };
      catalog.push(newEntry);
      writeJson(PATHS.catalog, catalog);
      const set = loadReviewed();
      set.add(original.id);
      saveReviewed(set);
      return sendJson(res, 200, { ok: true, added: newEntry });
    }

    if (route === 'POST /api/catalog/update') {
      // Body: { id, patch: {...} }
      const body = await readBody(req);
      const { id, patch } = body;
      if (!id || !patch) return sendJson(res, 400, { error: 'missing id or patch' });
      backupCatalog();
      const catalog = readJson(PATHS.catalog);
      const idx = catalog.findIndex((s) => s.id === id);
      if (idx < 0) return sendJson(res, 404, { error: 'id not in catalog' });
      catalog[idx] = { ...catalog[idx], ...patch, id }; // never overwrite id
      writeJson(PATHS.catalog, catalog);
      const set = loadReviewed();
      set.add(id);
      saveReviewed(set);
      return sendJson(res, 200, { ok: true, updated: catalog[idx] });
    }

    if (route === 'POST /api/catalog/remove') {
      const body = await readBody(req);
      const { id } = body;
      if (!id) return sendJson(res, 400, { error: 'missing id' });
      backupCatalog();
      const catalog = readJson(PATHS.catalog);
      const next = catalog.filter((s) => s.id !== id);
      if (next.length === catalog.length) {
        return sendJson(res, 404, { error: 'id not in catalog' });
      }
      writeJson(PATHS.catalog, next);
      const set = loadReviewed();
      set.add(id);
      saveReviewed(set);
      return sendJson(res, 200, { ok: true, remaining: next.length });
    }

    return sendJson(res, 404, { error: 'unknown route', route });
  } catch (e) {
    console.error(e);
    return sendJson(res, 500, { error: String(e) });
  }
});

server.listen(PORT, () => {
  console.log(`Curator listening at http://localhost:${PORT}`);
  console.log(`Open that URL in your browser to start editing.`);
  console.log(`Catalog backups land in app/_catalog-backups/ before every write.`);
});
