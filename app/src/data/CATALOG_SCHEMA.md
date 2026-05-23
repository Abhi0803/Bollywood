# Catalog schema — `catalog.json`

This is the source of truth for every song in Naam Bolo. Edit it directly. The app hot-reloads on save.

After any edit, run `node app/scripts/dump-catalog.mjs` from the repo root to regenerate the human-readable `CATALOG.md` summary.

## Shape

The file is a JSON array. Each entry is one song object. Order doesn't matter — the picker shuffles at runtime.

```json
{
  "id": "s48",
  "song": "Pardesi Pardesi",
  "movie": "Raja Hindustani",
  "year": 1996,
  "director": "Dharmesh Darshan",
  "cast": "Aamir Khan, Karisma Kapoor",
  "plot": "A wealthy young woman and a small-town taxi driver fall in love across a class divide.",
  "duration": 414,
  "swatch": ["#ff8c42", "#2cd4c0"],
  "era": "90s",
  "mood": "Romantic",
  "popularity": 1
}
```

## Field reference

| Field | Type | Notes |
|---|---|---|
| `id` | string | Must be unique. Convention: `s<number>`. Used internally for history dedupe — don't reuse old IDs even after deleting a song. |
| `song` | string | Title as it appears on iTunes/Apple Music. Spelling here drives the search lookup, so be exact. |
| `movie` | string | Film name. The picker uses this for movie-diversity (one song per movie per game), so consistent spelling matters across entries from the same film. |
| `year` | number | Release year. |
| `director` | string | Primary director. If genuinely co-directed (e.g. "Abbas-Mustan"), use the joint credit. |
| `cast` | string | 2–4 leads, comma-separated. Shown on the Reveal screen and used as a hint. |
| `plot` | string | One sentence, no spoilers. Shown on Reveal + used as the "plot" hint (the most expensive one). |
| `duration` | number | Approximate full-song length in seconds. Visual only — actual playback is the 30s iTunes preview. |
| `swatch` | `[string, string]` | Two hex colors used for the Reveal poster gradient. Pick a pair that matches the song's vibe. See "Palette presets" below. |
| `era` | string | One of: `"90s"`, `"2000s"`, `"2010s"`, `"2020s"`. Used by the era filter. |
| `mood` | string | One of: `"Romantic"`, `"Wedding"`, `"Party"`, `"Sufi"`, `"Anthemic"`, `"Period"`, `"Coming-of-age"`, `"Roadtrip"`. Used by the mood filter. |
| `popularity` | number | `1` = iconic (everyone knows it), `2` = well-known among Bollywood fans, `3` = deep cut. Drives the picker's weight bias (2 : 1.5 : 1). |

## Palette presets

Copy-paste any of these `swatch` pairs:

| Vibe | swatch |
|---|---|
| Filmi pink + gold | `["#ff2d6f", "#ffd166"]` |
| Purple + teal | `["#7a3eb1", "#2cd4c0"]` |
| Orange + gold | `["#ff8c42", "#ffd166"]` |
| Gold + teal | `["#ffd166", "#2cd4c0"]` |
| Dark pink + gold | `["#c81d77", "#ffd166"]` |
| Yellow + green (vintage) | `["#f3c623", "#1a7431"]` |
| Pink + purple | `["#ff2d6f", "#7a3eb1"]` |
| Dark + orange | `["#2a1448", "#ff8c42"]` |
| Orange + teal | `["#ff8c42", "#2cd4c0"]` |
| Purple + pink | `["#7a3eb1", "#ff2d6f"]` |

## Adding a song — checklist

1. Pick a unique `id` (next free `s<n>`)
2. Verify `year` and `director` — wrong metadata makes the Reveal screen lie to players
3. Choose `era` and `mood` carefully — these drive filter behavior
4. Choose `popularity` honestly — over-rating deep cuts as 1 makes the picker surface them too often and feels off
5. Save the file → the app hot-reloads → start a new game to verify

## Why JSON and not a TypeScript array?

Easier to edit in any tool (VS Code, text editor, Google Sheets via "Save as JSON"), easier for non-engineers to contribute, no need to remember TypeScript syntax, and the file shows up in plain "diff me" view on GitHub for catalog PRs.

For bulk imports (CSV → JSON, Wikipedia scrape → JSON), write a small script under `app/scripts/`. We have `dump-catalog.mjs` as a reference for the file shape.
