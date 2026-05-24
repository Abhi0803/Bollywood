# Naam Bolo — Roadmap

A two-team Bollywood song-guessing game. Host phone plays a song; teams
buzz in to name the movie.

---

## Current state (as of 2026-05-24)

**Done:**
- 12 screens (Splash, Login, Connect, Home, AddSong, Settings, Teams, Filters, RoundReady, Playing + Hints/Buzz overlays, Reveal, Summary)
- 2594 verified-playable Bollywood songs (Era + Mood + Director + Cast + Plot)
- iTunes preview audio with fuzzy lookup, cross-song bleed protection, 30/45s timer options
- Difficulty (easy/normal/hard), hints (cost points), cancel/block/quit/pause flow
- Persistence (file system): prefs, teams, blocklist, user-added songs, history
- Catalog curator (localhost:7878) for adding/verifying/blocking songs
- Supabase auth: Email OTP ✅, Google ✅ (TestFlight-only), Apple ✅ (TestFlight-only)
- Sign-out with confirmation, persistent session on relaunch
- EAS Build pipeline (~24 of 30 monthly credits left), TestFlight #4 installed
- GitHub Pages: privacy + terms at `abhi0803.github.io/Bollywood/`
- Custom SMTP via Gmail (dev limit 500/day — fine for beta, swap to Resend before public)

---

## 🚀 ASAP — Path to App Store (estimated 2–3 days of focused work)

### Day 1 — Finish auth + verify build
- [ ] EAS Build #5 finishes (running now, full auth wired)
- [ ] `eas submit --platform ios --latest` → push to TestFlight
- [ ] Install TestFlight build on iPhone
- [ ] Verify: Email OTP, Google sign-in, Apple sign-in, sign-out, persistence
- [ ] If anything broken → fix, rebuild, retest

### Day 2 — App Store Connect metadata
- [ ] Decide iPad strategy: set `app.json` → `supportsTablet: false` (skip iPad screenshots) OR build iPad layouts
- [ ] **App icon polish** — review current 1024×1024 icon, make sure it's distinctive (gold/pink filmi vibe), no transparency, no rounded corners (Apple adds those)
- [ ] **Screenshots** (5–10 per device size, 6.7" iPhone required, 6.5" iPhone required):
  - Splash + brand moment
  - Sign-in screen
  - Home with teams set up
  - Gameplay (Playing screen with vinyl + timer)
  - Hint overlay
  - Buzzed-in moment
  - Reveal screen
  - Summary / scoreboard
- [ ] **App Store description** — 2-3 paragraph pitch, what makes it different
- [ ] **Promotional text** — 170 chars, changeable without re-review (use for launch promos)
- [ ] **Keywords** — 100 chars, comma-separated (e.g. `bollywood,songs,trivia,quiz,music,hindi,filmi,guess,antakshari,party`)
- [ ] **Category**: Primary = `Trivia` (or `Music`), Secondary = `Entertainment`
- [ ] **Age rating** — answer the questionnaire (likely 4+; nothing inappropriate)
- [ ] **Privacy policy URL**: `https://abhi0803.github.io/Bollywood/privacy`
- [ ] **Support URL**: `https://abhi0803.github.io/Bollywood/`
- [ ] **Marketing URL** (optional): same as support
- [ ] **App Privacy disclosures** — Apple's nutrition label questionnaire:
  - Email collected (for auth) — linked to user, used for app functionality
  - Name collected (from Apple/Google) — linked to user, used for app functionality
  - User content (added songs) — stored on device only
  - No tracking, no third-party sharing beyond Supabase (auth provider)

### Day 3 — Submit for review
- [ ] **Demo account** for App Review — create a test Gmail or use a real one Apple reviewers can sign into. They WILL test it.
- [ ] **Review notes** — short paragraph: "App requires sign-in. Use the email OTP flow — enter `[demo email]`, Supabase will send a 6-digit code, enter it. Or Apple/Google sign-in. Then tap New Game → set up 2 teams → start playing."
- [ ] **Contact info** for review (your email + phone)
- [ ] **Export compliance** — confirm `ITSAppUsesNonExemptEncryption: false` is set (it is)
- [ ] Submit for App Review
- [ ] **Wait 1-3 days** for approval (sometimes hours, sometimes a week)
- [ ] If rejected: fix the cited issue, resubmit
- [ ] If approved: choose "Release manually" or "Automatic on approval"

---

## 🛠 Strongly recommended before public launch (1 day of work, deferrable)

These don't BLOCK App Store approval but make v1.0 sustainable:

- [ ] **Custom domain** (e.g. `naambolo.app`) — needed for branded Resend SMTP, custom support email
- [ ] **Resend SMTP** instead of Gmail — 3000/mo free, no rate limit, proper deliverability
- [ ] **Sentry crash reporting** — free tier 5K errors/mo. Without it you're blind to user crashes.
- [ ] **PostHog product analytics** — free tier 1M events/mo. Tells you which screens drop users, what songs get skipped most, where the funnel breaks.

---

## 📈 v1.1 — Sticky / shareable (first month after launch)

Ranked by likely impact on retention + growth:

1. **Share your score** with deep link — "I scored 340 with my team! 🎵 [link]" → opens app to a pre-filled lobby. Single biggest growth lever for party games.
2. **Daily song** — one new song per day, everyone gets the same, share streaks. Brings users back daily.
3. **Push notifications** — only for daily song drop. Just one a day, no spam.
4. **Game variety** — Speed Round (3s clips), Era Night (only 90s), Movie Marathon (all songs from one film), Antakshari Mode (chain by last syllable).

---

## 🎯 v1.2 / v2 — Bigger swings (months 2-6)

- **Real multiplayer (separate devices)** — host phone is "screen", player phones are buzzers via Supabase Realtime. Massive feature, defer until you have proof of demand.
- **Apple Music / Spotify full songs** — currently stubbed; requires MusicKit entitlement + Spotify commercial approval. Higher-quality audio, full songs.
- **Regional editions** — Tamil / Telugu / Punjabi music. Each is essentially a catalog expansion + tagging update.
- **Tournament mode** — multi-round bracket between teams.
- **Leaderboards + achievements** — global "biggest underdog" badge etc.
- **Spectator / TV mode** — AirPlay to TV for big parties.
- **Hindi UI translation** — broaden audience inside India.
- **Single-player practice mode** — solo training to learn songs without needing a group.

---

## 🧹 Quality / polish backlog (continuous)

Things that came up during dev that should be revisited:

- [ ] `SafeAreaView` deprecation warning — migrate to `react-native-safe-area-context`
- [ ] Sound effects (buzz, reveal sting, correct/wrong sting)
- [ ] Haptic feedback on winning buzz and correct answer
- [ ] Accessibility pass — VoiceOver labels, large-text mode support, color-contrast for color-blind users
- [ ] Better team avatars (currently single-letter circles)
- [ ] Settings screen: wire up Privacy & Data / Help & Feedback rows (currently no-ops) — link to GH Pages and `mailto:`
- [ ] Onboarding tour for first-time users (current Splash → Login is utilitarian, no explanation of game)
- [ ] Trademark check on "Naam Bolo" name (don't want a takedown after launch)
- [ ] iPad screenshots OR `supportsTablet: false` (see Day 2)

---

## 🔒 Compliance reminders

- ✅ Apple Developer Program enrolled (Team ZRZ67ZZM5Z)
- ✅ Sign in with Apple capability enabled (required because we offer Google sign-in)
- ✅ Privacy policy + Terms live on GH Pages
- ✅ `ITSAppUsesNonExemptEncryption: false` (no custom crypto)
- ⏳ App Privacy nutrition labels (declare in App Store Connect, Day 2)
- ⏳ iTunes Search API terms re-verify (still allows preview playback in commercial apps as of 2026)
- 🚫 MusicKit / Spotify approvals NOT needed for v1 (we only use free iTunes previews)

---

## 📂 Project layout

```
ROADMAP.md            ← this file
README.md             ← repo overview
docs/                 ← GitHub Pages source (privacy, terms)
app/
  App.tsx             ← root + screen router + auth-state mirror + deep-link listener
  app.json            ← Expo config (Bundle ID, plugins, scheme)
  eas.json            ← EAS Build profiles
  .env                ← Supabase URL + key (gitignored)
  src/
    data/catalog.json ← 2594 songs
    lib/supabase.ts   ← Supabase client + chunked SecureStore adapter
    state/            ← useGameState, useAuthSession, auth, preferences, blocklist, history
    services/         ← songPicker, itunesLookup, audio helpers
    screens/          ← all 12 screens
    components/       ← FilmiButton, ScreenLayout, etc.
    theme/            ← colors, radius, type
catalog-curator/      ← localhost:7878 admin tool (verify songs, edit metadata)
```

---

_Last updated: 2026-05-24 — TestFlight build #5 in flight with full auth wired._
