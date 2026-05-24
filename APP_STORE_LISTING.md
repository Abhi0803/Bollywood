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

## App Privacy — Nutrition Labels

Apple's questionnaire walks you through this. Exact answers for Naam Bolo:

### Data Types Collected

**☑ Contact Info → Email Address**
- Purpose: App Functionality
- Linked to user: **Yes**
- Used for tracking: **No**

**☑ User Content → Other User Content (name)**
- Purpose: App Functionality
- Linked to user: **Yes**
- Used for tracking: **No**

**☑ Identifiers → User ID**
- Purpose: App Functionality
- Linked to user: **Yes**
- Used for tracking: **No**

### NOT collected

- Location, Health, Financial Info, Sensitive Info, Browsing History, Search History, Diagnostics, Usage Data, Photos, Videos, Audio Data, Contacts.

### Tracking

**No** — the app does not track users across apps owned by other companies.

### Third Parties

Disclose that Supabase is used for authentication/session storage. (Apple doesn't require listing this in the nutrition label, but if asked in review notes, mention it.)

---

## Demo Account for App Review

Apple reviewers need to sign in to test the app. Easiest path: use **Apple Sign In** — reviewers all have Apple IDs, no demo account needed.

Provide in review notes:
```
DEMO ACCOUNT: Not required — use "Continue with Apple" on the Login screen to sign in instantly with the reviewer's own Apple ID.

If email sign-in must be tested instead, contact us at jhaabhinav08@gmail.com and we will provide a working email OTP test account.
```

---

## Review Notes (Apple's "Notes" field)

```
Naam Bolo is a Bollywood song-guessing party game for two teams.

SIGN-IN
The app requires sign-in. Easiest path: tap "Continue with Apple" on the Login screen — uses the reviewer's own Apple ID. Alternatively, "Continue with Google" or email OTP work.

HOW TO TEST THE GAMEPLAY
1. Sign in (use Apple Sign In — fastest)
2. On Home, tap "New Game"
3. Default 2 teams are pre-filled — tap Continue
4. On Filters, default era/mood selections are fine — tap "Start Game"
5. Tap "Play" to start round 1 — a 30-second Bollywood song clip plays from iTunes Search API previews
6. Tap any team's name to simulate that team buzzing in
7. On the Buzzed overlay, tap "Correct" or "Wrong" — Correct banks the points, Wrong gives the other team a chance
8. After 5 rounds, the Summary screen shows the winner

CONTENT
The 2500+ song catalog ships embedded with the app (JSON). Audio plays from iTunes Search API previews (https://itunes.apple.com/search) — no music subscription needed.

CONTACT
jhaabhinav08@gmail.com
```

---

## Screenshots Required

| Device size | Resolution | Min | Max |
|---|---|---|---|
| **6.7" iPhone** (iPhone 15/16 Pro Max) | 1290 × 2796 | 3 | 10 |
| **6.5" iPhone** (iPhone 11 Pro Max etc.) | 1242 × 2688 | 3 | 10 |
| 5.5" iPhone | 1242 × 2208 | optional | — |
| iPad | only if `supportsTablet: true` | — | — |

**Recommended 8 screenshots (in this order — App Store shows the first 3 prominently):**

1. **Hero shot** — Playing screen with vinyl + timer, mid-round
2. **Sign-in** — Login screen with three auth options
3. **Home** — Welcome screen, "New Game" button visible
4. **Teams setup** — 2 teams with custom names + colors
5. **Filters** — Era + Mood chips selected
6. **Hints overlay** — Hints panel open showing 5 hint options with point costs
7. **Buzzed-in** — A team buzzed, Correct/Wrong overlay visible
8. **Reveal** — Song revealed, movie name + points scored

---

## App Icon Requirements

- 1024 × 1024 PNG, **no transparency**, **no rounded corners** (Apple rounds them)
- Should be distinctive at small sizes (test at 60×60)
- Current icon is at `app/assets/icon.png`

Sanity check: does the icon work at 60×60 in a row of 30 other app icons? If not, simplify.

---

## Final pre-submission checklist

- [ ] Build #6 uploaded to TestFlight, installed, all 3 auth flows tested
- [ ] All metadata above copy/pasted into App Store Connect
- [ ] 6.7" iPhone screenshots uploaded (3-10 images)
- [ ] 6.5" iPhone screenshots uploaded (3-10 images)
- [ ] Privacy nutrition labels completed
- [ ] Review notes filled in
- [ ] Demo account note (or "use Apple Sign In") in review notes
- [ ] `supportsTablet: false` in app.json IF skipping iPad (or build iPad screenshots)
- [ ] Export compliance answered (no custom crypto = simple yes/no)
- [ ] Pricing + availability selected
- [ ] App icon final
- [ ] Submit for App Review
