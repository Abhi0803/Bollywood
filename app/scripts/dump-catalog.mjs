// Read src/data/catalog.json (the source of truth) and emit CATALOG.md
// at the repo root — a human-readable summary grouped by era → movie.
// Re-run after editing catalog.json.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..', 'src', 'data', 'catalog.json');
const OUT = path.resolve(__dirname, '..', '..', 'CATALOG.md');

const songs = JSON.parse(fs.readFileSync(SRC, 'utf8'));

if (!Array.isArray(songs) || songs.length === 0) {
  console.error('catalog.json must be a non-empty array.');
  process.exit(1);
}

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

Auto-generated from \`app/src/data/catalog.json\`. Re-run \`node app/scripts/dump-catalog.mjs\` after edits.

**Total**: ${songs.length} songs across ${Object.values(byEra).reduce((acc, m) => acc + Object.keys(m).length, 0)} movies.

**Popularity legend**: 🔥 iconic · ◐ well-known · ◌ deep cut

The picker uses **only one song per movie per game** (movie diversity rule, see \`app/src/services/songPicker.ts\`). Movies with 3+ songs below give the picker more options to choose from across many games.

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
