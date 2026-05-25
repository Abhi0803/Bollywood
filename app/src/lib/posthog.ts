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

// Singleton client for imperative calls outside the React tree
// (e.g., inside reducers, async callbacks).
let posthogClient: PostHog | null = null;

export async function initPostHog() {
  if (posthogClient) return posthogClient;
  posthogClient = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    // Send events as soon as we have ≥10 queued OR every 30s.
    flushAt: 10,
    flushInterval: 30000,
  });
  return posthogClient;
}

// Track an event. Falls back to no-op if PostHog hasn't initialized yet
// (which should never happen if App.tsx wires it up at mount).
export function track(event: string, properties?: EventProps) {
  if (!posthogClient) return;
  posthogClient.capture(event, properties);
}

// Identify a user once they sign in. PostHog will associate prior
// anonymous events with this user.
export function identify(userId: string, traits?: EventProps) {
  if (!posthogClient) return;
  posthogClient.identify(userId, traits);
}

// Reset on sign-out so the next user's events don't get attributed
// to the previous account.
export function resetPostHog() {
  if (!posthogClient) return;
  posthogClient.reset();
}

// Re-export the Provider so App.tsx doesn't import posthog-react-native
// directly.
export { POSTHOG_API_KEY, POSTHOG_HOST, PostHogProvider };
