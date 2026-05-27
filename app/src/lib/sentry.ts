// Sentry — production crash reporting + JS error capture.
//
// The DSN is intentionally public (Sentry DSNs are embedded in every
// shipped client and are designed to be discoverable from a bundle —
// rate-limiting + inbound filters on the server side prevent abuse).
//
// Initialized as early as possible in App.tsx so the very first render
// error surfaces. In dev (__DEV__ true), events are still sent so we
// catch crashes during testing too, but with `environment: dev` so we
// can filter them out in the Sentry dashboard.

import * as Sentry from '@sentry/react-native';

const DSN =
  'https://1ad504a98a74f5617f63ca1dec1ecae8@o4511451593179136.ingest.us.sentry.io/4511451597570048';

export function initSentry() {
  Sentry.init({
    dsn: DSN,
    environment: __DEV__ ? 'dev' : 'production',
    // Send everything; tune sampling if we ever blow past the 5K/mo free
    // tier (we won't anytime soon).
    sampleRate: 1.0,
    // Only enable interaction/touch breadcrumbs and console capture.
    // Skip performance tracing for v1.1 — keeps event volume low.
    tracesSampleRate: 0,
    // Don't swallow errors — let our ErrorBoundary still render the
    // crash screen. Sentry just observes.
    enableAutoSessionTracking: true,
    // Drop WatchdogTermination at the SDK level. iOS raises these for
    // many non-actionable reasons (memory pressure when backgrounded,
    // user force-quit racing the OS, transient hangs). Individual events
    // are noise; a real RAM regression would show as a sustained spike
    // we'd notice via crash-free-users in the Releases tab regardless.
    beforeSend(event) {
      const type = event.exception?.values?.[0]?.type;
      if (type === 'WatchdogTermination') return null;
      return event;
    },
  });
}

// Manually report an error from anywhere (e.g. caught exceptions in
// async flows where the ErrorBoundary won't catch).
export function reportError(err: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(err, { extra: context });
}

// Re-export the wrap HOC for App.tsx so we don't import Sentry directly
// from multiple places.
export const wrap = Sentry.wrap;
