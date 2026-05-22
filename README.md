# Handoff: Naam Bolo — Bollywood Song-Guessing Game

A two-team party game. The host phone plays a Bollywood song; players hear only
the audio (no movie name, no poster, no metadata). First team to shout the
correct movie name wins. Hints (actor, director, year, plot snippet) can be
revealed at a points cost.

---

## About the Design Files

The files in `prototype/` are **design references created in HTML** — a
clickable prototype showing the intended look, flow, and behavior. They are
NOT production code to copy directly.

Your task is to **recreate these designs in a real native or cross-platform
mobile codebase**. The recommended stack is in the next section, but pick what
fits your team; the visual / interaction spec in this README is
framework-agnostic.

The prototype runs in any browser — open `prototype/index.html` to walk through
all 11 screens. The Tweaks panel (toggle in the toolbar / `?edit=true`) lets
you jump to any screen and swap visual variants.

---

## Fidelity

**High-fidelity.** Final colors, typography, spacing, motion, copy, and
interactions are locked. Recreate pixel-perfectly using the target codebase's
patterns. Hex values, font sizes, animation durations, and exact copy in this
README are authoritative.

---

## Recommended Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native + Expo** | One codebase for iOS + Android; SDKs available for both music services |
| Auth | **Supabase** (preferred) or Firebase | Email magic link, Apple, Google, phone |
| Audio (free tier) | `expo-av` | Plays Apple's 30-sec preview URLs |
| Audio (linked, iOS) | **MusicKit** via `react-native-apple-music` | Full songs through user's Apple Music subscription |
| Audio (linked, cross-platform) | **Spotify** via `react-native-spotify-remote` | Requires user's Premium |
| Backend | Supabase Postgres | Song catalog + game history |
| Realtime (multiplayer) | Supabase Realtime | If you add buzzer-from-separate-phones mode |

See `ROADMAP.md` for the full week-by-week implementation plan and the
pre-launch compliance checklist (Apple MusicKit entitlement, Spotify
commercial approval, App Store privacy labels, etc.).

---

## Music Licensing — Critical Context

**You cannot host or stream copyrighted Bollywood audio yourself.** Doing so
without a deal with each label (T-Series, Saregama, Sony, Zee, etc.) is
infringement. The 30-second "preview" exemption does NOT exist in copyright
law — Spotify/Apple show previews only because their licensing contracts
specifically permit it.

The two viable approaches, both implemented in the prototype's Connect screen:

1. **Free tier — Apple Music preview API**: hit
   `https://itunes.apple.com/search?term=<song>&entity=song&country=in`, get
   a public 30-sec `previewUrl`, play through `expo-av`. No subscription, no
   login, fully legal. Caveat: Apple picks the clip (usually the chorus =
   easier game) and you can't seek within it.

2. **Pro tier — linked subscription**:
   - Apple Music (MusicKit) — works on iOS, Android, and web; supports
     in-app trial sign-up. **Primary recommendation.**
   - Spotify Web Playback SDK — full Premium only (Premium Mini, the cheap
     India tier, is NOT supported). Spotify requires written commercial-use
     approval before launch.

The prototype's `ConnectScreen` shows both tiers with a segmented control.

---

## Screen Inventory & Flow

```
Splash → Login → Connect Music → Home ⇄ Settings
                                  ↓
                                Teams → Filters → Round Ready → Playing ↔ Hints
                                                                  ↓ (buzz)
                                                                Buzzed
                                                                  ↓
                                                                Reveal → (next round or) Summary
```

Source: `prototype/scripts/screens.jsx`, orchestrated by `prototype/scripts/App.jsx`.

### 1. Splash
- **Purpose:** First-launch attract screen
- **Layout:** Centered. Top + bottom rows of pulsing marquee bulbs frame the
  content. Center: spinning vinyl disc behind italic title "Naam Bolo." with a
  gold full-stop accent.
- **Copy:** "— A Bollywood Game —" (uppercase, gold, monospaced label) /
  "Play the song. Name the movie. First team to shout wins."
- **CTA:** Filmi-pink button "Tap to begin →"

### 2. Login
- **Purpose:** Account creation / sign-in. Required for cross-device history.
- **Layout:** Back-pill top-left. Stack: label "Welcome back" → display title
  "Sign in to play." → 3 social buttons → "OR" divider → email field → primary
  CTA → ToS/Privacy footnote.
- **Social buttons:** Continue with Apple (black bg, white text) / Google
  (white bg, black) / Phone (subtle dark bg). All 50px tall, 14px radius.
- **Email field:** 14px radius, dark glass background, monospaced "EMAIL" label.

### 3. Connect Music
- **Purpose:** Pick free 30-sec previews OR link a full subscription.
- **Layout:** Step "2 of 3" label → title "Connect your music." → 2-option
  segmented control (Free · 30s clips / Full song · linked) → service cards
  → explanatory info card (legal context).
- **Service cards (free):** "30-second previews" card with "30s" badge logo
  and "No subscription" green tag.
- **Service cards (full):** Apple Music (recommended, gold "Recommended" tag,
  red gradient bg) and Spotify (subtle gray bg).
- **Info card content:** Free tier → "Fully legal · Free forever". Full tier →
  "Why a subscription?" explaining label licensing.

### 4. Home
- **Purpose:** Game hub. Start new round, resume, see leaderboard, change
  modes, access Settings.
- **Layout:** Header row (greeting + user name + music chip + avatar button) →
  hero gradient card "Tonight's antakshari" with decorative vinyl in corner →
  2-col secondary cards (Last game / Top team) → modes list (Classic,
  Solo Practice, Era Sprint).
- **Avatar pill (top-right, 36×36):** opens Settings. Pink-to-gold gradient
  with user's first initial in italic serif.
- **Music chip:** Shows current service logo + name (Apple Music / Spotify /
  30s preview).

### 5. Settings
- **Purpose:** Profile, change/disconnect music service, preferences, sign out.
- **Layout:** Back-pill, large title "Settings.", scrolling groups:
  1. **Profile** — avatar + name + email + caret
  2. **Connected music** — current service row (with ● ACTIVE badge) →
     "Change music source" row → "Disconnect" row (red)
  3. **Preferences** — Sound effects toggle, Haptics toggle, Adult content
     toggle, Default round timer ("30s"), Language ("हिन्दी · English")
  4. **Account** — Privacy & data, Help & feedback, About (v0.1.0), Sign out
- **"Change music source" routes back to Connect; on save, returns to Settings (not Home).** Track this with a `prevScreen` variable.

### 6. Teams
- **Purpose:** Name teams, pick palettes, add up to 4 teams.
- **Layout:** Back, step label, title "The teams." Each team row is a wide
  card with: avatar (tappable to cycle palette), team name (inline-editable),
  current score on the right.
- **Add team row** appears below if `< 4` teams. Dashed-style ghost button.
- **Default teams (2-team):** Mehndi (pink/gold) vs Sangeet (teal/purple).
  3- and 4-team defaults add Baraat and Vidaai. See `App.jsx` `DEFAULT_TEAMS_BY_COUNT`.

### 7. Filters
- **Purpose:** Filter the song deck.
- **Layout:** Sections:
  - **Era** chips: 90s · 2000s · 2010s · 2020s (multi-select)
  - **Mood** chips: Romantic, Wedding, Party, Sufi, Anthemic, Period, Coming-of-age
  - **Rounds** segmented: 5 / 7 / 10 / 15
  - **Round timer** slider: 15–90s, step 5, default 30s. Shows big italic
    "30s" with "per song before reveal" hint
  - **Hints** toggle: "Allow hint cards · Cost points · Don't reveal the movie"

### 8. Round Ready (between-rounds beat)
- Big italic round number ("03") with "Round / of 5" labels. Both team
  avatars with current scores side-by-side under "vs". Score-differential pill
  ("Mehndi leads by 20"). Gold CTA "▶ Play the song".

### 9. Playing — anti-spoiler now-playing (the critical screen)
- **Purpose:** Play song. Hide everything that would give the movie away.
- **What's allowed on screen:**
  - Round counter ("Round 3 / 5")
  - Italic label "Now playing." (gold)
  - Circular timer ring (top-right) — color shifts to filmi pink under 10s
  - Abstract artwork (one of: mystery card, spinning vinyl, audio
    visualizer, or cinema curtain — switchable via `antiSpoiler` tweak)
  - Animated waveform bar (visual cue that audio is playing)
  - "✦ Need a hint?" button with `0/5 used` counter
  - Two big per-team buzz buttons at the bottom with team gradients
- **What's FORBIDDEN on screen:** song title, movie name, year, poster,
  director name, cast names, album art, anything searchable.
- **Buzz buttons:** Each ~80px tall, gradient matching team color, italic
  team name + "Tap to buzz" mono caption. Tap → buzzed overlay.

### 10. Hints Overlay
- Full-screen sheet animating up over Playing. Title "Hints." + close.
- 5 hint cards, each shows label + icon + cost. Tap to reveal in-place
  (revealed cards show value in gold gradient bg with "−<cost>" badge):
  - Year of release — 10 pts
  - Mood — 10 pts
  - Director — 15 pts
  - Cast — 20 pts
  - Plot snippet — 25 pts
- See `data.jsx` `HINTS` array. Total possible hint cost: 80 pts. Award is
  `max(20, 100 − totalHintCost)`.

### 11. Buzzed Overlay
- Background goes to team's color radial. Mono label "BUZZED · MUSIC PAUSED"
  in gold. Triple-ring pulse animation around team avatar (100px). Italic
  team name + "Name the movie..." → big quote box → CTA buttons.
- **Two CTAs:** "✓ Correct — Award the point" (gold) / "✗ Wrong — Resume
  music" (ghost). Wrong = −10 penalty + resume timer.

### 12. Reveal
- Faux movie-poster card with film-strip edges (perforated edges drawn with
  repeating linear gradient). Color uses the song's `swatch` pair from
  `data.jsx`.
- Shows: "The song was" → song title in italic → divider → "from the film"
  → movie name (big italic) → year + director → cast.
- If a team won, score badge animates in below: team avatar + name +
  "X points this round" + big italic "+X".
- Confetti drops in winning team's gold color.
- CTA: "Next round →" or "See final scores →" if last round.

### 13. Summary
- Trophy moment: winner avatar (96px) + giant italic team name + "X POINTS"
  in monospaced gold. Or "Tied at" if scores match.
- Ranked scoreboard below (winner row has team-colored gradient bg).
- Songs-played log: scrollable list of all rounds with movie name, song,
  winner avatar + points (or "—" if missed).
- Two CTAs: ghost "Home" / primary "Play again".

---

## Design Tokens

### Colors

```
/* Backgrounds */
--bg-deep:     #160828   /* base dark eggplant */
--bg-card:     #2a1448   /* card surfaces */
--bg-radial:   radial-gradient(800px 500px at 0% 0%, rgba(255,45,111,0.18), transparent 50%),
               radial-gradient(800px 600px at 100% 100%, rgba(255,209,102,0.10), transparent 55%),
               #160828

/* Filmi accents */
--filmi:       #ff2d6f   /* primary action pink */
--filmi-dark:  #c81d77   /* gradient bottom */
--gold:        #ffd166   /* labels, highlights, CTAs */
--saffron:     #ff8c42   /* secondary warm accent */
--teal:        #2cd4c0   /* second team color */
--purple:      #7a3eb1   /* gradient end for teams */
--success:     #3dffb1   /* "Connected" / "Active" green */
--danger:      #ff5577   /* destructive actions */

/* Ink (on dark bg) */
--ink:         #faf3e0   /* primary text — warm cream, not pure white */
--ink-dim:     rgba(250,243,224,0.62)
--ink-faint:   rgba(250,243,224,0.32)
--line:        rgba(250,243,224,0.10)
```

### Typography

```
DM Serif Display Italic   — display, movie titles, team names, hero
Manrope                   — UI body, buttons, list rows, hints
JetBrains Mono            — labels, timers, scores, "STEP 2 OF 3" style metadata

Sizes used:
- Hero italic:  56–76px / line-height 0.92–1
- Section title: 32–42px
- Body large:  15–17px
- Body:        13–14px
- Caption/mono: 10–11px, letter-spacing 0.2–0.4em, uppercase
- Score (mono): 16–24px, weight 700
```

All fonts loaded from Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
```

### Spacing & radius

```
Card padding: 14–22px
Card radius: 14–22px (rounded; matches iOS feel)
Button radius: 12–18px
Pill radius: 999px
Outer screen padding: 22px sides, 62–70px top (under status bar)
```

### Shadows

```
Card lift:   0 16px 36px rgba(0,0,0,0.35)
Button pink: 0 8px 20px rgba(255,45,111,0.4), inset 0 1px 0 rgba(255,255,255,0.2)
Button gold: 0 8px 20px rgba(255,209,102,0.3), inset 0 1px 0 rgba(255,255,255,0.4)
Hairline:    inset 0 0 0 0.5px rgba(255,255,255,0.1)
Glow:        0 0 32px <color>66
```

### Motion

```
Bulb pulse:        1.6s ease-in-out, stagger 0.08s
Vinyl spin:        6s linear infinite
Waveform bar:      0.6–1.4s cubic-bezier(.5,0,.5,1) alternate
Mystery breathe:   4s ease-in-out alternate
Buzz ring pulse:   1.6s ease-out (3 staggered rings)
Confetti drop:     2–3.4s linear forwards
Fade-up:           0.25s ease-out
Timer ring:        stroke-dashoffset transition 0.4s linear
```

All keyframes in `prototype/scripts/ui.jsx` (`__keyframes` block).

---

## State Machine

Implemented in `prototype/scripts/App.jsx` as a single `screen` state plus
supporting state. Re-implement as a stack-based navigator (React Navigation
in RN) but preserve these transitions:

```
splash    → login (or home if signed in)
login     → connect (or home if music already linked)
connect   → home (or back to settings if prevScreen === 'settings')
home      → teams (start new game)
home      → settings (tap avatar)
settings  → connect (change music)
settings  → splash (sign out clears user + service)
teams     → filters
filters   → ready (initial round; resets scores + builds deck)
ready     → playing (starts timer)
playing   → buzzed (any team buzz)
buzzed    → playing (wrong: penalty + resume)
buzzed    → reveal (correct: award + log)
playing   → reveal (timer 0 OR skip)
reveal    → ready (more rounds) | summary (last round)
summary   → teams (restart) | home
```

### Required state variables

```js
screen, service, user, prevScreen
teams (name, score, emoji, color1, color2)
filters (eras[], moods[], rounds, timer, hintsOn)
round, songDeck, songIdx
timeLeft, maxTime
hintsUsed[], showHints
buzzed (team index | null)
history (per-round log)
lastWin ({winner, points} | null)
```

---

## Song Catalog

Sample dataset in `prototype/scripts/data.jsx` (12 songs) shows the schema:

```js
{
  id, song, movie, year, director, cast, plot,
  duration, swatch: [color1, color2], era, mood
}
```

**Production catalog needs:**
- ~500 songs hand-curated
- Per song, add `appleMusicId` and `spotifyUri` for direct lookup
- Difficulty rating (1–5) — for "easy mode" round packs
- Store in Postgres table or static JSON depending on update cadence

Eras used: `90s`, `2000s`, `2010s`, `2020s`.
Moods used: `Romantic`, `Wedding`, `Party`, `Sufi`, `Anthemic`, `Period`,
`Coming-of-age`, `Roadtrip`. Extend as needed.

---

## Scoring

```
Base correct guess:     100 points
Penalty per hint used:  10 / 10 / 15 / 20 / 25 (year, mood, director, cast, plot)
Floor:                  Math.max(20, 100 - totalHintCost)
Wrong buzz penalty:     -10 points
Timer expiry:           No one scores; song revealed
```

---

## Custom Components Reference

See `prototype/scripts/ui.jsx`. Key components:

| Component | Purpose |
|---|---|
| `BulbStrip` | Pulsing marquee bulbs around content (Splash, Home hero) |
| `WaveBars` | Animated audio waveform (Playing screen) |
| `VinylDisc` | Spinning vinyl with center label (Splash, Playing) |
| `MysteryCard` | Tarot-style hidden card with filigree corners (Playing) |
| `CinemaCurtains` | Red theatre curtain alt for Playing |
| `TimerRing` | Circular SVG progress ring with center text |
| `FilmiButton` | Primary/gold/ghost/dark button variants |
| `TeamAvatar` | Gradient circle with initial — drives team identity |
| `Chip` | Filter pill (active = gold, inactive = subtle) |
| `Confetti` | Win-state falling pieces, recycle for Summary |

---

## Required Permissions

- **Notifications** (optional, for game-resume prompts)
- **Network** (catalog + auth + music API)
- **Audio output** (handled by SDK)

No camera, mic, or photo permissions required for v1.

---

## Pre-Launch Checklist

See `ROADMAP.md` for the full week-by-week plan. Key items:

- [ ] Apple Developer Program enrollment ($99/yr)
- [ ] Apple MusicKit entitlement request
- [ ] Spotify Developer Terms commercial-use approval (email request)
- [ ] App Store privacy nutrition labels
- [ ] Terms of Service + Privacy Policy
- [ ] iTunes Search API terms verified for commercial preview playback

---

## Files in This Bundle

```
README.md                              ← this file
ROADMAP.md                             ← full week-by-week dev plan
prototype/                             ← HTML design reference
  index.html                           ← entry point — open in any browser
  scripts/
    data.jsx                           ← song catalog + hints + palettes
    ui.jsx                             ← visual primitives (waveform, vinyl, etc.)
    screens.jsx                        ← all 11 screens
    App.jsx                            ← state machine + Tweaks
  frames/
    ios-frame.jsx                      ← iOS device chrome (reference only)
    tweaks-panel.jsx                   ← in-prototype variant switcher
app/                                   ← React Native + Expo implementation
  App.tsx                              ← root component
  src/
    screens/PreviewPocScreen.tsx       ← Phase 0: iTunes preview playback POC
    services/itunesApi.ts              ← iTunes Search API client
    theme/tokens.ts                    ← design tokens (colors, radius, spacing)
```

---

## Running the App

Phase 0 (the iTunes preview-URL POC) is wired in `app/`. Stack: Expo SDK 56,
React Native 0.85, expo-audio (replaces deprecated expo-av).

```bash
cd app
npm install                # one-time
npm start                  # opens Expo dev server + QR code
```

Then either:
- Scan the QR code with **Expo Go** on iOS/Android (easiest on Windows)
- Press `a` for Android emulator, `w` for web (audio playback flakier on web)

The POC screen searches the iTunes Store for Bollywood songs (default term:
"tum hi ho"), lists matches with artwork, and plays the 30-second `previewUrl`
through `expo-audio`. This single test validates the free-tier licensing
path before any catalog work begins.

---

## Questions for the Designer / PM (resolve before building)

- Single-device or multi-device buzz mode? (Currently designed single-device.)
- Free + Pro IAP model, or ad-supported free + Pro?
- Regional editions (Tamil, Telugu, Punjabi) — v1 or later?
- Catalog admin tool needed in-app, or stays server-side?
- Cast-to-TV / spectator mode?

---

_Generated from the HTML design prototype. Open `prototype/index.html` to
explore the live mocks before starting implementation._
