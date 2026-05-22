# Naam Bolo — Project TODO & Notes

A two-team Bollywood song-guessing game. The host phone plays a song; players
hear only the audio and shout the movie name. First team to correctly answer wins.

This file is the master plan: licensing answers, prototype status, and the
roadmap to ship.

---

## 1 · Music Licensing — Answers

### Can the app legally play full songs?
**Only by linking the user's existing music subscription.** We cannot host or
stream copyrighted Bollywood audio ourselves — that would require direct deals
with every label (T-Series, Saregama, Sony Music India, Zee Music, Tips,
Yash Raj Music) plus the publishing society (IPRS).

### Does "30 seconds" make hosting clips legal?
**No.** There is no "short clip" exemption in copyright law anywhere
(US, India, EU). The 30-second clips you see on Spotify / Apple Music previews
exist because **those platforms have direct licensing contracts** that permit
previews. The 30 seconds is a contract term, not a legal carve-out we inherit.

### The realistic playback options (ranked)

| Option | Cost | Catalog | UX trade-off |
|---|---|---|---|
| **Apple Music preview API** | Free | Almost all Bollywood | 30 sec only, Apple picks the clip (usually chorus = easier) |
| **Deezer preview API** | Free | Good Bollywood | Same 30-sec limit |
| **Apple Music (MusicKit) linked** | User's subscription | Full | User must subscribe; trial flow works in-app |
| **Spotify Web Playback SDK linked** | User's Premium | Full | Requires *full* Premium — Premium Mini (most India users) NOT supported; Spotify wants written approval for commercial use |
| **Direct label licensing** | Expensive + slow | Full | Not realistic pre-launch |
| **YouTube embed** | Free | Full | Video title/thumbnail shows the movie — kills the game |

### Decision for v1
- **Free tier:** Apple Music preview API → 30-sec clips, no login needed
- **Pro tier:** Apple Music MusicKit primary, Spotify secondary → full songs

---

## 2 · Prototype Status (Current HTML)

✅ **Done** — see `index.html`

- 11 screens fully designed and wired
  - Splash, Login, Connect Music, Home, Settings, Team Setup, Filters,
    Round Ready, Playing (anti-spoiler), Reveal, Summary
- Anti-spoiler "Now Playing" screen with 4 visual styles
  (Mystery card · Vinyl · Visualizer · Curtain — switchable in Tweaks)
- Hints overlay (Year / Mood / Director / Cast / Plot — each costs points)
- Buzz-to-answer overlay with pulsing ring + Correct/Wrong scoring
- Settings screen with "Change music source" + "Disconnect" rows
- Two-tier Connect screen (Free 30s vs Full songs)
- Tweaks panel: anti-spoiler style, hints, team count, timer, jump-to-screen

---

## 3 · Dev Roadmap

### Phase 0 — Validate the licensing path (1 week)
- [ ] Set up Apple Developer account ($99/yr)
- [ ] Build a tiny proof-of-concept: hit
      `https://itunes.apple.com/search?term=tum+hi+ho&entity=song&country=in`
      and play the returned `previewUrl` in a basic React Native screen
- [ ] This single test confirms the free tier works end-to-end

### Phase 1 — Stack & scaffold (week 1–2)
- [ ] React Native + Expo (cross-platform, fastest path)
- [ ] Auth: Supabase or Firebase (email magic link + Apple + Google + phone)
- [ ] Audio: `expo-av` for previews, MusicKit wrapper for full songs
- [ ] Recommended libraries:
  - [ ] `react-native-apple-music` (or roll your own MusicKit bridge)
  - [ ] `react-native-spotify-remote`

### Phase 2 — Song catalog (week 2–3) — **the actual moat**
- [ ] Hand-curate ~500 Bollywood songs in a JSON file or Postgres table
- [ ] Required fields per song: title, movie, year, director, cast, mood, era,
      Apple Music store ID, Spotify URI, difficulty rating
- [ ] Spend time on metadata quality — this directly shapes game difficulty
- [ ] Tag for filters (era · mood · genre · hero/heroine)

### Phase 3 — Core game loop (week 3–4)
- [ ] Port the screens from this prototype to React Native
- [ ] Wire scoring, timer, hint costs, history log
- [ ] Persist game state locally (AsyncStorage) so resume works

### Phase 4 — Music linking (week 4–6)
- [ ] Apple Music: request MusicKit entitlement from Apple
- [ ] Apple Music: implement subscription check + trial sign-up in-app
- [ ] Apple Music: implement playback with arbitrary seek
- [ ] Spotify: email Spotify Developer Relations for commercial approval
- [ ] Spotify: implement OAuth + Web Playback SDK
- [ ] Fall back to preview API if linking fails

### Phase 5 — Multiplayer party mode (optional, week 6–7)
- [ ] One host phone plays; player phones become buzzers via local WiFi or QR
- [ ] Realtime: Supabase Realtime or Firebase channels
- [ ] Anti-cheat: hide song metadata on player phones too

### Phase 6 — Polish & beta (week 7–8)
- [ ] Sound effects (buzz, reveal sting, correct/wrong)
- [ ] Haptics on winning buzz
- [ ] Hindi + English UI translations
- [ ] Accessibility pass
- [ ] Beta test with 10 friend groups; measure: songs guessed, hint usage,
      session length, ragequits
- [ ] App Store screenshots + privacy nutrition labels

### Phase 7 — Launch
- [ ] iOS App Store submission
- [ ] Google Play submission
- [ ] Landing page with demo video
- [ ] Reach out to Bollywood / quiz YouTubers for organic launch

---

## 4 · Pre-Launch Compliance Checklist

- [ ] **Apple Developer Program** enrollment ($99/yr)
- [ ] **MusicKit entitlement** request approved
- [ ] **Spotify Developer Terms** — written commercial use approval from Spotify
- [ ] **App Store privacy labels** — declare what data is collected and why
- [ ] **Terms of Service + Privacy Policy** drafted
- [ ] **Trademark check** — confirm "Naam Bolo" / chosen brand name is clear
- [ ] **No additional Indian music licensing** required when piggybacking on
      streaming services (they hold the licenses)
- [ ] **Confirm Apple iTunes Search API terms** allow preview playback in
      commercial apps (it does as of 2025, but re-verify)

---

## 5 · Open Design Questions

- [ ] **Host-vs-guest split?** Currently designed as one phone for everyone.
      Do players each have their own phone (buzzer mode)?
- [ ] **In-app purchases?** Pro tier (full songs) vs ad-supported free tier?
- [ ] **Regional editions?** Tamil, Telugu, Punjabi music guessing games?
- [ ] **Catalog admin tool?** Internal-only screen for adding songs?
- [ ] **Social features?** Share-able round summaries, friend rivalries?
- [ ] **Spectator / TV mode?** Cast to a big screen for parties?

---

## 6 · Brand & Naming Notes

- Current working name: **Naam Bolo** (Hindi: "say the name")
  - Alternatives considered: Antakshari, Filmi, Bollywood Buzz
- Visual identity: filmi pink (#ff2d6f) + gold (#ffd166) on deep eggplant
- Type: DM Serif Display Italic (display) + Manrope (UI) + JetBrains Mono (numbers)
- Vibe: 70s/80s Bollywood poster meets modern iOS

---

## 7 · Files in This Project

```
index.html              ← demo HTML prototype (iOS frame, all screens, Tweaks)
scripts/
  data.jsx              ← sample song catalog + hint costs + palette presets
  ui.jsx                ← shared visual primitives (waveform, vinyl, mystery card, buttons)
  screens.jsx           ← all 11 screens
  App.jsx               ← state machine + Tweaks panel wiring
frames/
  ios-frame.jsx         ← iOS 26 device chrome
  tweaks-panel.jsx      ← floating Tweaks shell + controls
TODO.md                 ← this file
```

---

_Last updated: design phase complete · ready for handoff to engineering._
