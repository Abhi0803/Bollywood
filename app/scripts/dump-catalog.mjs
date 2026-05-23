// One-shot script: read src/data/catalog.ts via a TS-naive parser, emit
// CATALOG.md grouped by era → movie. Run with `node scripts/dump-catalog.mjs`
// whenever the catalog changes.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', 'src', 'data', 'catalog.ts');
const OUT = path.resolve(__dirname, '..', '..', 'CATALOG.md');

const text = fs.readFileSync(SRC, 'utf8');

// Crude but effective: each song is a single-line { id: 's…', … } object.
const songLine = /\{\s*id:\s*'([^']+)',\s*song:\s*'([^']+)',\s*movie:\s*'([^']+)',\s*year:\s*(\d+),\s*director:\s*'([^']+)',\s*cast:\s*'([^']+)',\s*plot:\s*'([^']+)',\s*duration:\s*\d+,\s*swatch:\s*\w+,\s*era:\s*'([^']+)',\s*mood:\s*'([^']+)',\s*popularity:\s*(\d)\s*\}/g;

const songs = [];
let m;
while ((m = songLine.exec(text)) !== null) {
  songs.push({
    id: m[1], song: m[2], movie: m[3], year: Number(m[4]),
    director: m[5], cast: m[6], plot: m[7],
    era: m[8], mood: m[9], popularity: Number(m[10]),
  });
}

if (songs.length === 0) {
  console.error('No songs parsed — check the regex / source file format.');
  process.exit(1);
}

// Group: era → movie → [songs]
const ERA_ORDER = ['90s', '2000s', '2010s', '2020s'];
const byEra = {};
for (const e of ERA_ORDER) byEra[e] = {};
for (const s of songs) {
  if (!byEra[s.era]) byEra[s.era] = {};
  const key = `${s.movie} (${s.year})`;
  if (!byEra[s.era][key]) byEra[s.era][key] = [];
  byEra[s.era][key].push(s);
}

const POP_LABEL = { 1: '🔥', 2: '◐', 3: '◌' };

let out = `# Naam Bolo — Song Catalog

Auto-generated from \`app/src/data/catalog.ts\`. Re-run \`node app/scripts/dump-catalog.mjs\` after edits.

**Total**: ${songs.length} songs across ${Object.values(byEra).reduce((acc, m) => acc + Object.keys(m).length, 0)} movies.

**Popularity legend**: 🔥 iconic · ◐ well-known · ◌ deep cut

Each movie counts each song separately — when the picker runs, it tries to use **only one song per movie per game** (movie diversity rule, see \`app/src/services/songPicker.ts\`).

---

`;

for (const era of ERA_ORDER) {
  const movies = Object.keys(byEra[era] || {}).sort();
  if (movies.length === 0) continue;
  const eraSongs = movies.reduce((acc, k) => acc + byEra[era][k].length, 0);
  out += `## ${era} · ${movies.length} movies · ${eraSongs} songs\n\n`;
  for (const movie of movies) {
    const list = byEra[era][movie];
    const dir = list[0].director;
    const cast = list[0].cast;
    out += `### ${movie} — *dir. ${dir}*\n`;
    out += `${cast}\n\n`;
    for (const s of list) {
      out += `- ${POP_LABEL[s.popularity]} **${s.song}** · ${s.mood} · \`${s.id}\`\n`;
    }
    out += `\n`;
  }
}

fs.writeFileSync(OUT, out);
console.log(`Wrote ${OUT} — ${songs.length} songs.`);
