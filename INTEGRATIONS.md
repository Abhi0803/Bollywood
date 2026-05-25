# Integrations & External Services

Single source of truth for every account, dashboard URL, credential location, and setup procedure used by Naam Bolo. If you ever need to rebuild from scratch, hand this off to a co-founder, or revoke access, this is the file.

**Last updated:** 2026-05-25

---

## Quick reference

| Service | Purpose | Login | Dashboard | Cost |
|---|---|---|---|---|
| Apple Developer | iOS distribution + capabilities | jhaabhinav08@gmail.com | https://developer.apple.com/account/ | $99/yr |
| App Store Connect | App listing, builds, reviews | same Apple ID | https://appstoreconnect.apple.com/apps/6772662415 | (included) |
| EAS (Expo) | Build pipeline + OTA updates | abhi08nav | https://expo.dev/accounts/abhi08nav/projects/naam-bolo | Free (30 builds/mo) |
| GitHub | Source code + Pages | Abhi0803 | https://github.com/Abhi0803/Bollywood | Free |
| Supabase | Auth + DB | jhaabhinav08@gmail.com | https://supabase.com/dashboard/project/tiupdnnyxaybndswvbny | Free tier |
| Google Cloud Console | Google OAuth client | jhaabhinav08@gmail.com | https://console.cloud.google.com/auth/clients?project=naam-bolo | Free |
| Hostinger | `naambolo.com` domain + DNS | jhaabhinav08@gmail.com | https://hpanel.hostinger.com | ~₹1000/yr |
| Resend | Transactional email (SMTP) | jhaabhinav08@gmail.com | https://resend.com | Free (3000/mo) |
| Sentry | Crash + JS error reporting | jhaabhinav08@gmail.com | https://naam-bolo.sentry.io | Free (5K errors/mo) |
| PostHog | Product analytics | jhaabhinav08@gmail.com | https://us.posthog.com/project/439806 | Free (1M events/mo) |

---

## 1. Apple Developer Program

**What:** Required to distribute iOS apps. Issues code-signing certificates + manages App IDs / capabilities.

**Login:** https://developer.apple.com/account/

**Key identifiers:**
- Team ID: `ZRZ67ZZM5Z` (Abhinav Jha — Individual)
- Bundle ID: `com.abhinav.naambolo` ([App ID page](https://developer.apple.com/account/resources/identifiers/list))
- Provider ID: `128945234`

**Capabilities enabled on the App ID:**
- Sign In with Apple
- MusicKit (under "App Services" tab — self-serve, no entitlement request needed)

**To enable a new capability:**
1. Apple Developer → Certificates, Identifiers & Profiles → Identifiers
2. Click `com.abhinav.naambolo`
3. Scroll capabilities list, check the box
4. Save → regenerate provisioning profile via `npx eas-cli credentials --platform ios` (interactive, choose "remove provisioning profile" then rebuild)

**Cost:** $99/yr ($99 USD ≈ ₹8,300, renews yearly)

---

## 2. App Store Connect

**What:** App Store listing management, build submissions, TestFlight distribution, review status.

**Direct URL:** https://appstoreconnect.apple.com/apps/6772662415

**Key identifiers:**
- App ID (ASC): `6772662415` — used in `app/eas.json` as `ascAppId`

**Submission flow:**
1. `eas submit --platform ios --id <BUILD_ID> --non-interactive` from `app/` directory
2. Apple processes the build (~5-15 min) → appears in TestFlight + Version Build picker
3. Fill metadata (description, keywords, screenshots) — see `APP_STORE_LISTING.md` for copy-paste source
4. Click "Add for Review" → "Submit for Review"
5. Wait 24-48h for Apple review

---

## 3. EAS (Expo Application Services)

**What:** Cloud build service for React Native apps + over-the-air (OTA) updates.

**Account:** `abhi08nav` (owner)

**Project ID:** `08d37c8e-818f-46be-828c-dcf9d2e2f5e3` (in `app/app.json`)

**Dashboard:** https://expo.dev/accounts/abhi08nav/projects/naam-bolo

**Environment variables** (set on EAS server, not in repo):
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

To add/edit: `npx eas-cli env:create production --name <KEY> --value "<VALUE>" --visibility plaintext --type string`

**Common commands** (run from `app/` directory):
- Build for App Store: `npx eas-cli build --platform ios --profile production --non-interactive --no-wait`
- Submit a build: `npx eas-cli submit --platform ios --id <BUILD_ID> --non-interactive`
- View build: `npx eas-cli build:view <BUILD_ID>`
- Push OTA update: `npx eas-cli update --channel production --message "<short description>"`
- Regenerate credentials: `npx eas-cli credentials --platform ios` (interactive)

**Build channels** (in `app/eas.json`):
- `preview` — internal testing builds
- `production` — App Store + TestFlight builds (channel explicitly set in eas.json)

**Cost:** Free tier — 30 builds/month. Build #1-9 used so far in May 2026.

---

## 4. GitHub

**What:** Source code repo + GitHub Pages for privacy policy + terms.

**Account:** `Abhi0803`

**Repo:** https://github.com/Abhi0803/Bollywood

**GitHub Pages:**
- Source: `docs/` directory in repo
- Live URLs:
  - Home: https://abhi0803.github.io/Bollywood/
  - Privacy: https://abhi0803.github.io/Bollywood/privacy
  - Terms: https://abhi0803.github.io/Bollywood/terms

**Branch:** `main` (the only branch)

**Push command:** `git push origin main`

**⚠ Never commit:**
- `app/.env` (gitignored — contains Supabase credentials)
- Apple certificate files (`.p8`, `.p12`, `.mobileprovision`)
- Service-role keys

---

## 5. Supabase

**What:** Auth provider (email OTP, Google OAuth, Apple Sign In) + future DB. Acts as a "BaaS" — handles user accounts so we don't run our own backend.

**Login:** https://supabase.com/dashboard

**Project:** `tiupdnnyxaybndswvbny` (display name: `naam-bolo`)

**Project URL:** https://tiupdnnyxaybndswvbny.supabase.co (region: Mumbai / ap-south-1, Free tier)

**Direct dashboard:** https://supabase.com/dashboard/project/tiupdnnyxaybndswvbny

**Credentials in app:**
- `EXPO_PUBLIC_SUPABASE_URL` = base URL above (safe to ship publicly)
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_QB7eQUH3ASdHaXt60s20WA_QHPF9jdM` (safe to ship — RLS protects data, not this key)
- Local: `app/.env` (gitignored)
- Production: EAS env vars

**Authentication config:**
- Email OTP: enabled, 6-digit code
- Google: enabled, uses Google Cloud OAuth client (see §6)
- Apple: enabled, uses Bundle ID `com.abhinav.naambolo` for native iOS validation
- Redirect URLs allowed: `naambolo://**`, `exp://**`

**Email templates:** Authentication → Emails → Templates
- Both "Confirm sign up" and "Magic link or OTP" templates contain `{{ .Token }}` (the 6-digit code)

**SMTP:** Authentication → Emails → SMTP Settings (currently Resend, see §8)

**To add a new auth provider:** Dashboard → Authentication → Sign In / Providers → toggle on + paste client ID/secret

---

## 6. Google Cloud Console

**What:** Hosts the OAuth 2.0 Client used for "Continue with Google" sign-in. Supabase brokers the OAuth flow with this client.

**Login:** https://console.cloud.google.com

**Project:** `naam-bolo`

**Direct dashboards:**
- OAuth consent: https://console.cloud.google.com/auth/branding?project=naam-bolo
- OAuth clients: https://console.cloud.google.com/auth/clients?project=naam-bolo

**Configuration:**
- Audience: External (any Google user can sign in)
- Authorized redirect URI: `https://tiupdnnyxaybndswvbny.supabase.co/auth/v1/callback`

**Credentials:**
- Client ID + Client Secret (Web application type) — stored in Supabase Google provider config, NOT in app code

**To rotate:** Create new OAuth client in Google Cloud → update Supabase Google provider → delete old client

---

## 7. Hostinger (`naambolo.com` domain + DNS)

**What:** Domain registrar for `naambolo.com`. DNS records here control what `naambolo.com` resolves to, and authorize email senders.

**Login:** https://hpanel.hostinger.com

**Active DNS records:**
| Type | Name | Content | Purpose |
|---|---|---|---|
| MX | send | feedback-smtp.us-east-1.amazonses.com (priority 10) | Resend SPF |
| TXT | send | `v=spf1 include:amazonses.com ~all` | Resend SPF |
| TXT | resend._domainkey | `p=MIGfMA…QIDAQAB` (long DKIM key) | Resend DKIM |
| TXT | _dmarc | `v=DMARC1; p=none;` | DMARC monitoring |

**Cost:** ~₹1000/yr for `.com` (renewal price may be higher)

---

## 8. Resend (Transactional Email / SMTP)

**What:** Sends OTP codes from Supabase on behalf of `noreply@naambolo.com`. Replaces Gmail SMTP (which had 500/day cap and worse deliverability).

**Login:** https://resend.com

**Verified domain:** `naambolo.com` (SPF + DKIM + DMARC records added in Hostinger — see §7)

**API key:** Stored in Supabase SMTP password field. NOT in app code.

**Supabase SMTP config:**
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend` (literal string)
- Password: `re_...` (Resend API key)
- Sender email: `noreply@naambolo.com`
- Sender name: `Naam Bolo`

**Cost:** Free tier — 3000 emails/month, 100/day. Easily covers v1.0–v1.1 traffic.

**To rotate the API key:** Resend dashboard → API Keys → revoke old → create new → paste into Supabase SMTP password field.

---

## 9. Sentry (Crash + Error Reporting)

**What:** Captures uncaught JS exceptions + native crashes from the app, with stack traces. Lets us see what's breaking on real users' phones without their cooperation.

**Login:** https://sentry.io

**Org:** `naam-bolo`

**Dashboard:** https://naam-bolo.sentry.io

**DSN** (public, embedded in app):
`https://1ad504a98a74f5617f63ca1dec1ecae8@o4511451593179136.ingest.us.sentry.io/4511451597570048`

**Where wired:**
- SDK init: `app/src/lib/sentry.ts`
- Called from `app/App.tsx` at module top (before React mounts)
- Inner `<ErrorBoundary>` also calls `reportError(err)`

**Plan:** 14-day free trial of Business, then auto-downgrade to Developer (free, 5K errors/mo).

---

## 10. PostHog (Product Analytics)

**What:** Tracks screen views, button taps, game-start / answer-correct / share events. Lets us see funnel drop-off, popular features, retention.

**Login:** https://us.posthog.com

**Project ID:** `439806`

**Dashboard:** https://us.posthog.com/project/439806

**Project API Key** (public, embedded in app):
`phc_ptPUc6ddzHqzokyQYe99x3Bqczwpd3Psv74P7vQdbAXC`

**Region:** US

**Where wired:**
- SDK init + helpers: `app/src/lib/posthog.ts`
- Called from `app/App.tsx` at module top
- `<PostHogProvider>` wraps the app for autocapture + session replay
- Manual `track('event_name', {...})` calls in `App.tsx`, `useGameState.ts`, `SummaryScreen.tsx`

**Key events tracked:**
- `screen_viewed` (every screen change)
- `signed_in` (with email domain)
- `game_started` (filters, difficulty)
- `answer_correct`, `answer_wrong`, `round_missed`
- `game_completed` (winner score, ties)
- `game_quit` (at which round)
- `summary_shared` (when user taps Share)

**Cost:** Free tier — 1M events/mo, 5K session replays/mo. Plenty for early traffic.

---

## App-level credentials map (where each secret lives)

| Secret | Where stored | How to access |
|---|---|---|
| Supabase URL + ANON key (prod build) | EAS env vars (production) | `npx eas-cli env:list production` |
| Supabase URL + ANON key (dev) | `app/.env` (gitignored) | Local filesystem |
| Apple distribution cert | EAS-managed | `npx eas-cli credentials --platform ios` |
| Apple provisioning profile | EAS-managed | same as above |
| Google OAuth client secret | Supabase Google provider config | Supabase dashboard only |
| Resend API key | Supabase SMTP password field | Supabase dashboard only |
| Apple App Store Connect API key | EAS-managed (auto-uploaded) | `npx eas-cli credentials --platform ios` |
| Sentry DSN | Hardcoded (public) in `app/src/lib/sentry.ts` | Repo |
| PostHog API Key | Hardcoded (public) in `app/src/lib/posthog.ts` | Repo |

---

## Disaster recovery — "I lost access" scenarios

| Lost | How to recover |
|---|---|
| Gmail account (jhaabhinav08@gmail.com) | This is the master account for everything except GitHub. Google account recovery flow at https://accounts.google.com/signin/recovery |
| GitHub account (Abhi0803) | Email recovery at https://github.com/password_reset |
| Apple Developer access | Apple ID recovery (separate from Google) at https://iforgot.apple.com — Team ID `ZRZ67ZZM5Z` must be remembered |
| EAS account | `eas login` with same Apple ID-linked email |
| Resend account | Resend uses Google sign-in — recover via Google |
| Supabase | Supabase uses GitHub sign-in OR email — recover via either |

---

## Related files in repo

- `ROADMAP.md` — what's next
- `APP_STORE_LISTING.md` — copy/paste source for App Store metadata
- `app/AGENTS.md` / `app/CLAUDE.md` — Claude conventions for this project
- `app/patches/` — runtime patches applied via `patch-package` (currently: supabase-js OTel fix)
- `marketing/screenshots/` — App Store screenshots (originals + resized)
