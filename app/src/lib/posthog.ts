// PostHog — product analytics. Tracks screen views, key game events,
// and (via PostHogProvider) automatic touch + navigation breadcrumbs.
//
// The project token is intentionally public — it only allows event
// INGESTION, not data egress. Anyone can post events to your project
// (rate-limited by PostHog), but no one can read your data without an
// API key, which is a separate, private token kept on the server side.

import PostHog, { PostHogProvider } from 'posthog-react-native';

const POSTHOG_API_KEY = 'phc_ptPUc6ddzHqzokyQYe99x3Bqczwpd3Psv74P7vQdbAXC';
const POSTHOG_HOST = 'https://us.i.posthog.com';

// PostHog only accepts JSON-serializable property values. Loosely typed
// here so callers don't have to fight the type system for common cases
// like booleans, ids, counts.
export type EventProps = Record<string, string | number | boolean | null>;

// Single PostHog client shared by both <PostHogProvider> (for autocapture
// + breadcrumbs) and imperative track() calls. Previously we instantiated
// two clients — the Provider's internal one (via apiKey prop) and a second
// one here — which doubled every network call (config/flags/batch) and
// every in-memory queue. initPostHog() is idempotent: call it once at app
// boot, pass the returned client to <PostHogProvider client={...}>.
let posthogClient: PostHog | null = null;

export function initPostHog(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      flushAt: 10,
      flushInterval: 30000,
    });
  }
  return posthogClient;
}

export function track(event: string, properties?: EventProps) {
  if (!posthogClient) return;
  posthogClient.capture(event, properties);
}

export function identify(userId: string, traits?: EventProps) {
  if (!posthogClient) return;
  posthogClient.identify(userId, traits);
}

export function resetPostHog() {
  if (!posthogClient) return;
  posthogClient.reset();
}

// Re-export the Provider so App.tsx doesn't import posthog-react-native
// directly.
export { POSTHOG_API_KEY, POSTHOG_HOST, PostHogProvider };
