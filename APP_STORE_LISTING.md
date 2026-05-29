# App Store Listing — Naam Bolo

Copy/paste source for App Store Connect submission. Edit before final use.

---

## App Information

| Field | Value | Notes |
|---|---|---|
| **App Name** | `Naam Bolo` | 30 char max; this is 9 |
| **Subtitle** | `Bollywood song trivia game` | 30 char max; this is 26 |
| **Bundle ID** | `com.abhinav.naambolo` | — |
| **Primary Category** | `Trivia` | Best fit; `Music` is alternative |
| **Secondary Category** | `Entertainment` | Optional but recommended |
| **Age Rating** | `4+` | No objectionable content |
| **Price** | Free | — |
| **Availability** | All countries (or India + diaspora markets initially) | — |

---

## Promotional Text (170 char, editable anytime without re-review)

> Two teams. One song. First to name the movie wins. Naam Bolo is the Bollywood music party game — 2500+ songs, era and mood filters, hint system. Free to play.

(166 chars)

---

## Description (4000 char limit)

```
Naam Bolo turns any gathering into a Bollywood quiz night. Two teams. A song plays. First to name the movie wins.

We packed in 2,500+ Hindi film songs spanning the 70s through today — Kishore Kumar to Arijit Singh, RD Burman to Pritam, Mughal-e-Azam to Animal. Choose your era (90s romance? 2010s wedding bangers?), your mood (romantic, sad, party, devotional), set the timer, and let the buzzing begin.

KEY FEATURES
• 2 teams, customizable names and colors
• 2,500+ verified Bollywood songs with 30-second clips
• Era filters: 70s, 80s, 90s, 2000s, 2010s, 2020s
• Mood filters: Romantic, Party, Sad, Devotional, Patriotic, and more
• Three difficulty levels — Easy serves the hits, Hard digs into deep cuts
• Hint system: reveal year, director, cast, mood, or plot (each costs points)
• Block songs you don't want to see again
• Add your own songs to the catalog
• Sign in with Apple, Google, or email — your choice

HOW IT WORKS
1. Pick your teams (2-4 players each, or solo)
2. Set era and mood filters to match the crowd
3. Press play — a song clip starts
4. First team to know the movie buzzes in
5. Right answer banks the points. Wrong gives the other team a chance.
6. Reveal screen shows the movie, song, year, and director

PERFECT FOR
• Family gatherings and antakshari nights
• Sangeet and wedding ice-breakers
• Office parties and team-building
• Long road trips
• Any time two or more Hindi music fans need to settle who knows their Bollywood better

Hindi music lovers — this one's for you. Naam bolo: say the name.
```

(1480 chars — well under 4000 limit)

---

## Keywords (100 char limit, comma-separated, NO spaces between)

```
bollywood,hindi,song,music,trivia,quiz,party,game,filmi,antakshari,guess,movie,family,sangeet
```

(95 chars)

Avoid: words already in the title (`naam`, `bolo`), competitor app names, brand names.

---

## URLs

| Field | URL |
|---|---|
| **Support URL** | `https://abhi0803.github.io/Bollywood/` |
| **Marketing URL** (optional) | same as Support |
| **Privacy Policy URL** | `https://abhi0803.github.io/Bollywood/privacy` |

---

## App Privacy — Nutrition Labels (UPDATED for v1.2.1)

These labels MUST match what the app actually does. The original v1.0 list
was incomplete — v1.1 added Sentry (crash data) + PostHog (analytics),
v1.2 added Apple Music. Updated table below.

### Data Types Collected

**☑ Contact Info → Email Address**
- Sources: Supabase auth (Apple/Google/email sign-in)
- Purposes: **App Functionality**, **Analytics** (PostHog `identify`)
- Linked to user: **Yes**
- Used for tracking: **No**

**☑ User Content → Other User Content** *(display name)*
- Sources: Apple / Google sign-in (only when granted)
- Purpose: **App Functionality**
- Linked to user: **Yes**
- Used for tracking: **No**

**☑ Identifiers → User ID**
- Sources: Supabase auth user UUID, PostHog distinct ID
- Purposes: **App Functionality**, **Analytics**
- Linked to user: **Yes**
- Used for tracking: **No**

**☑ Diagnostics → Crash Data** *(Sentry)*
- Source: Sentry SDK on uncaught exceptions / native crashes
- Purpose: **App Functionality** (debugging)
- Linked to user: **No** (we do NOT send the email/name on crashes)
- Used for tracking: **No**

**☑ Diagnostics → Performance Data** *(Sentry release health)*
- Source: Sentry auto-session-tracking
- Purpose: **App Functionality**
- Linked to user: **No**
- Used for tracking: **No**

**☑ Usage Data → Product Interaction** *(PostHog)*
- Source: PostHog autocapture (touches) + manual `track()` calls
  for game events: game_started, audio_play_started, signed_in,
  apple_music_connected, song_reported_wrong, guest_mode_entered,
  account_deleted, etc.
- Purpose: **Analytics**
- Linked to user: **Yes** if signed in, **No** in guest mode
- Used for tracking: **No**

### NOT collected

- Location, Health, Financial Info, Sensitive Info, Browsing History,
  Search History, Photos, Videos, **Audio Data**, Contacts, Sensitive
  Info, Other Data Types. The app never accesses microphone, camera,
  GPS, contacts, or photos.

### Tracking

**No** — the app does not track users across other companies' apps or
websites. No advertising SDKs. No IDFA. No third-party tracking pixels.

### Third Parties (data processors)

For reference in review notes if asked; Apple's nutrition label doesn't
explicitly ask for these:
- **Supabase** (Mumbai, ap-south-1) — authentication, session storage,
  account deletion RPC
- **Resend** (US) — magic-link / OTP email delivery
- **Sentry** (US) — crash reports
- **PostHog** (US) — product analytics
- **Apple** (iTunes Search API + MusicKit) — song previews and full songs

---

## Demo Account for App Review (v1.2.1)

**Sign-in is now OPTIONAL** — reviewers can test the entire app via
"Skip · Play as guest" on the Login screen. No demo account needed for
core functionality.

For testing the account-deletion flow (5.1.1(v)), the reviewer can use
**"Continue with Apple"** which creates an account from their own Apple ID
in seconds. After signing in, Settings → Delete account removes it. The
reviewer's Apple ID is unaffected — only Naam Bolo's own account row is
deleted.

Provide in App Store Connect → "Sign-In Required" → **No** if it asks,
and in the Demo Account field:
```
DEMO ACCOUNT: Not required.
Sign-in is optional. Use "Skip · Play as guest" on the Login screen
for full gameplay without an account.

To test account creation + deletion (5.1.1(v) compliance), use
"Continue with Apple" — uses reviewer's own Apple ID. Then Settings
→ Delete account.

Email OTP test account available on request — email jhaabhinav08@gmail.com.
```

---

## Review Notes (Apple's "Notes" field — 4000 char limit)

Compressed to ~3700 chars. ASCII-only (no box-drawing characters) so
the character counter in ASC doesn't double-count any glyphs.

```
Naam Bolo is a Bollywood song-guessing party game.

Addresses rejection 2026-05-28 (sub d96fc2da). Both issues fixed
in v1.2.1 build 20.

5.1.1(v) ACCOUNT DELETION — FIXED

In-app: Settings -> "Delete account" -> confirm -> Supabase
SECURITY DEFINER RPC removes the auth row -> user signed out.
No website, no email, no support request needed.

Test: Login -> "Continue with Apple" -> Settings -> scroll ->
"Delete account" -> confirm. Account is gone from our database.

The 1.0 (9) build under review did not include this; v1.2.1
build 20 does.

5.2.3 THIRD-PARTY AUDIO — NO THIRD-PARTY AUDIO

Every audio source is Apple-owned:

1. 30s previews: Apple iTunes Search API
   https://itunes.apple.com/search — Apple's free public API.
   Apple's Affiliate Program ToS permits preview playback by
   any app with no separate license.

2. Full songs (optional, v1.2): Apple MusicKit framework
   https://developer.apple.com/musickit/
   Plays via ApplicationMusicPlayer using the user's OWN Apple
   Music subscription. No proxy, no DRM bypass, no caching.
   MusicKit capability enabled on App ID com.abhinav.naambolo.

3. Apple Music deep links — standard music.apple.com URLs.

4. Catalog (2594 entries): HAND-CURATED METADATA only — title,
   movie, year, director, cast. JSON in bundle. NO audio,
   NO lyrics, NO copyrighted artwork.

5. NO Spotify / YouTube / SoundCloud / Saavn / Wynk / Deezer /
   any non-Apple streaming. A disabled Spotify placeholder
   labeled "Coming later" appears in Settings — no traffic.

6. "Add song" submits metadata only (name/movie/year). No file
   upload. Lookup via iTunes Search API.

7. Local file writes are TEXT ONLY: prefs, blocklist, added-song
   metadata, history. No audio bytes ever touch disk.

Documentary chain Apple reviewer can verify:
 - Apple Developer Program License Agreement (accepted on
   enrolment) governs Apple API use.
 - iTunes Search API publicly documented at URL above.
 - MusicKit capability enabled on com.abhinav.naambolo in
   developer portal Identifiers section.
 - Privacy Policy https://abhi0803.github.io/Bollywood/privacy
   sections 1.4, 2, 4 declare the data flow.

HOW TO TEST (~3 min)

Guest mode (no account):
  Splash -> "Get started" -> Login -> "Skip · Play as guest"
  -> New Game -> defaults -> Start -> buzz a team -> Summary.

Signed-in (only for account features):
  "Continue with Apple" — reviewer's Apple ID. Settings ->
  "Delete account" works as above.

Apple Music (only if reviewer has subscription):
  Settings -> Change music source -> Full song tab -> Connect
  Apple Music -> grant access -> start game -> full songs play.

CONTACT
Abhinav Jha · jhaabhinav08@gmail.com
Privacy: https://abhi0803.github.io/Bollywood/privacy
Support: https://abhi0803.github.io/Bollywood/
```

---

## Screenshots Required

| Device size | Resolution | Min | Max |
|---|---|---|---|
| **6.7" iPhone** (iPhone 15/16 Pro Max) | 1290 × 2796 | 3 | 10 |
| **6.5" iPhone** (iPhone 11 Pro Max etc.) | 1242 × 2688 | 3 | 10 |
| 5.5" iPhone | 1242 × 2208 | optional | — |
| iPad | only if `supportsTablet: true` | — | — |

**Recommended 8 screenshots for v1.2.1 (App Store shows the first 3 prominently):**

Resized PNG/JPEG files live in `marketing/screenshots/resized/`.

1. **01-playing-hero** — Round 1/5 Playing screen (M vs S teams, 28s timer)
2. **02-buzzed-answer** — Buzzed overlay, "Correct / Wrong / Cancel"
3. **03-reveal-scoring** — Reveal screen (Choomantar) with Apple Music link
   and "Wrong song played? Report it" buttons — showcases v1.2 features
4. **04-login** — Login screen with **"Skip · Play as guest"** visible
   *(critical — proves 5.1.1 fix at a glance for the next reviewer)*
5. **05-home** — Home screen, "antakshari" callout
6. **07-filters** — Filters screen, era + mood + timer + difficulty
7. **08-settings** — Settings screen (Player not signed in, v1.2.0,
   "Change music source" → leads into Apple Music story)
8. Optionally **09-splash** if you have 8+ slots remaining

---

## App Icon Requirements

- 1024 × 1024 PNG, **no transparency**, **no rounded corners** (Apple rounds them)
- Should be distinctive at small sizes (test at 60×60)
- Current icon is at `app/assets/icon.png`

Sanity check: does the icon work at 60×60 in a row of 30 other app icons? If not, simplify.

---

## Final pre-submission checklist (v1.2.1 resubmit)

Before submitting:

- [ ] Supabase RPC `delete_my_account()` created and granted to `authenticated`
- [ ] Build #20 uploaded to TestFlight + tested guest mode + tested Delete account on physical device
- [ ] Build #20 selected in App Store Connect → Build section
- [ ] **Privacy nutrition labels updated** to add Diagnostics (Sentry) + Usage Data (PostHog) — the v1.0 labels were incomplete
- [ ] **Privacy Policy URL** still resolves: https://abhi0803.github.io/Bollywood/privacy
- [ ] **Review Notes** field has the new 5.1.1(v) + 5.2.3 text from this doc
- [ ] **Demo Account** field updated to mention guest mode + Delete account flow
- [ ] **Screenshots** updated to v1.2.1 versions (esp. 04-login showing "Skip · Play as guest")
- [ ] What's New field filled in: "Skip sign-in to play as guest. Apple Music subscribers can now play full songs. Delete account anytime from Settings."
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption: false` already in app.json
- [ ] Pricing + availability unchanged from v1.0 (free, all countries)
- [ ] App icon unchanged
- [ ] Resubmit for App Review

After submitting, reply on the rejection thread saying you've addressed
both 5.1.1(v) (in-app delete) and 5.2.3 (review notes now contain the
documentary chain — iTunes Search API URL, MusicKit docs, App ID capability).
