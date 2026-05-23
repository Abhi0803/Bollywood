# Naam Bolo · Catalog Curator

A tiny Node + browser tool to clean up the song catalog after a verification run. Two workflows:

1. **Recover NO_RESULTS** — Songs the verifier dropped because iTunes returned nothing. Browse the pruned pool, search iTunes for the right spelling, listen to candidates, add the corrected entry back to `catalog.json`.

2. **Fix WEAK matches** — Songs still in the catalog where iTunes returned a track but probably the wrong recording (different singer, different movie). Compare side-by-side, listen, decide: keep / update metadata to match / remove.

## Prereqs

Node 18+ (you already have it for Expo). No npm install needed — pure stdlib.

## Run

From the repo root:

```bash
node tools/catalog-curator/server.mjs
```

Then open **http://localhost:7878** in your browser. The terminal stays running — Ctrl+C when done.

Port 7878 is local-only (won't conflict with Metro's 8081, won't expose the editor to your LAN).

## What it touches

| File | Read | Write |
|---|---|---|
| `app/src/data/catalog.json` | ✓ | ✓ (auto-backup before each write) |
| `app/_catalog-backups/catalog-pre-prune.json` | ✓ | — |
| `app/scripts/verify-results.json` | ✓ | — |
| `tools/catalog-curator/.reviewed.json` | ✓ | ✓ (which IDs you've processed) |
| `app/_catalog-backups/catalog-<timestamp>.json` | — | ✓ (one per save) |

Every catalog write is preceded by a timestamped backup into `_catalog-backups/`. If something gets deleted by accident, restore the most recent file from there.

## Workflow

### Recover NO_RESULTS tab

The dropdown lists the 427 (or however many) songs the verifier pruned. For the active entry:

- The search box is pre-filled with `<song> <movie>`. Edit it and click **🔍 Search iTunes**.
- Browser hits Apple's Search API directly (no proxy through this server).
- Each result has an inline audio player and **✓ Add this back** button.
- Adding writes the entry back to `catalog.json` with the iTunes-confirmed title/movie/year (and the original era/mood/director/cast/etc. preserved).
- "Drop permanently" marks the entry reviewed but doesn't restore it — for cases where the song genuinely shouldn't be in the catalog.

### Fix WEAK tab

The dropdown lists the 621 (or however many) WEAK matches still in `catalog.json`. For the active entry:

- Left card shows what the catalog says.
- Right card shows what iTunes returned, with an audio player so you can hear what the game would actually play.
- **✓ Keep as-is** — accept the WEAK match (still playable; just not a high-confidence match).
- **✗ Remove from catalog** — deletes the entry (catalog.json shrinks).
- **🔍 Search for better match** — lets you find the right recording. Picking a result updates `catalog.json`'s `song` / `movie` / `year` fields to match what iTunes has.

## Progress tracking

Each item has a 🟢 ✓ REVIEWED badge once you've acted on it (any action — add back, update, remove, or just "mark reviewed"). The dropdown shows ✓ next to processed entries. **Skip to next unreviewed →** jumps past anything you've already touched.

If you want to start over, delete `tools/catalog-curator/.reviewed.json`.

## What it doesn't do

- Doesn't trigger an Expo rebuild — Metro will hot-reload `catalog.json` on the next save automatically, but if you have a game in progress on your phone the changes won't apply mid-round.
- Doesn't re-run iTunes verification on edited entries. Re-run `node app/scripts/verify-catalog.mjs` after a big batch of edits to see updated counters.
- Doesn't help with MAYBE matches — those play fine in 95%+ of cases; not worth manual review unless you spot a specific one as wrong during gameplay.
