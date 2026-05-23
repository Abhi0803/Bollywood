// One-shot: take the latest verify-results.json and prune catalog.json
// down to only the HIT entries (the songs the app can actually play
// correctly). Backs up the pre-prune catalog as
// _catalog-backups/catalog-pre-prune.json so the curator's recovery tab
// can offer the dropped songs for hand-curation.
//
// Run AFTER verify-catalog.mjs completes:
//   node app/scripts/auto-prune.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');

const CATALOG = path.join(REPO, 'app', 'src', 'data', 'catalog.json');
const VERIFY = path.join(REPO, 'app', 'scripts', 'verify-results.json');
const PRE_PRUNE = path.join(REPO, 'app', '_catalog-backups', 'catalog-pre-prune.json');
const BACKUP_DIR = path.join(REPO, 'app', '_catalog-backups');

// SCORE_THRESHOLD must match src/services/itunesLookup.ts. The runtime
// returns null for matches below this — silent round in-game. We prune
// those so they never appear in a round.
const SCORE_THRESHOLD = 5;

const verify = JSON.parse(fs.readFileSync(VERIFY, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));

const errors = verify.results.filter((r) => r.status === 'ERROR');
if (errors.length > 0) {
  console.warn(
    `WARN: ${errors.length} entries errored during verification. Re-run verify before pruning to avoid losing them.`,
  );
  process.exit(1);
}

// Apply the runtime threshold — not just status, because verify-catalog.mjs
// historically classified "any match found" as HIT regardless of score.
const passes = verify.results.filter((r) => (r.score ?? 0) >= SCORE_THRESHOLD);
const fails = verify.results.filter((r) => (r.score ?? 0) < SCORE_THRESHOLD);

console.log(
  `Verify: ${verify.results.length} total · ${passes.length} passable (score ≥ ${SCORE_THRESHOLD}) · ${fails.length} below threshold (silent in-game) · ${errors.length} errors`,
);

// Score breakdown for visibility
const bucket = {};
verify.results.forEach((r) => {
  bucket[r.score ?? 0] = (bucket[r.score ?? 0] || 0) + 1;
});
console.log(
  'Score distribution:',
  Object.entries(bucket)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([s, n]) => `${s}:${n}`)
    .join(' '),
);

const keepIds = new Set(passes.map((r) => r.id));

// Back up current catalog as the curator's recovery source.
fs.copyFileSync(CATALOG, PRE_PRUNE);
console.log(`Pre-prune backup → ${PRE_PRUNE} (${catalog.length} entries)`);

// Timestamped backup too, in case.
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
fs.copyFileSync(CATALOG, path.join(BACKUP_DIR, `catalog-fuzzy-prune-${stamp}.json`));

const kept = catalog.filter((s) => keepIds.has(s.id));
const renumbered = kept.map((s, i) => ({ ...s, id: 's' + (i + 1) }));
fs.writeFileSync(CATALOG, JSON.stringify(renumbered, null, 2) + '\n');

console.log(`Pruned catalog: ${catalog.length} → ${renumbered.length} entries (kept score ≥ ${SCORE_THRESHOLD})`);
console.log(`Dropped ${fails.length} songs that would have played silent in-game.`);
console.log(`Those songs live in the pre-prune backup; curator's Recover tab will surface them.`);
