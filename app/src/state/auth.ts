// Auth wrapper around Supabase — narrows supabase-js's broader API into
// the handful of methods our LoginScreen actually calls.
//
// All methods return `{ ok: boolean; error?: string }` so the UI doesn't
// need to know about Supabase's response shape.

import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { supabase } from '../lib/supabase';
import type { User } from './types';

export type AuthResult = { ok: boolean; error?: string };

// Required on Android, no-op on iOS, but safe to call once at module load.
WebBrowser.maybeCompleteAuthSession();

// Parse a redirect URL (either query `?token=` or fragment `#token=`) and
// install the resulting Supabase session. Used by both the WebBrowser
// completion path and the deep-link fallback.
export async function createSessionFromUrl(url: string): Promise<AuthResult> {
  try {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode) return { ok: false, error: errorCode };

    const access_token = params.access_token;
    const refresh_token = params.refresh_token;
    if (!access_token || !refresh_token) {
      return {
        ok: false,
        error: params.error_description ?? 'No session in redirect URL.',
      };
    }
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Could not parse redirect.' };
  }
}

// Magic-link email: Supabase sends a one-tap link to the user's inbox.
// Tapping the link opens our app via the `naambolo://` scheme (configured
// in app.json's `scheme`) and completes the sign-in.
export async function sendMagicLink(email: string): Promise<AuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: 'Enter an email address.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, error: 'That email doesn’t look valid.' };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: 'naambolo://auth-callback',
      shouldCreateUser: true,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Supabase sends both a magic link AND a 6-digit OTP code in the same
// email. We use the OTP code path because it works identically in Expo
// Go and in production builds (deep links require a real app install).
export async function verifyOtpCode(email: string, code: string): Promise<AuthResult> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedCode = code.trim();
  if (!trimmedCode) return { ok: false, error: 'Enter the 6-digit code from your email.' };
  const { error } = await supabase.auth.verifyOtp({
    email: trimmedEmail,
    token: trimmedCode,
    type: 'email',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// Google OAuth flow that works inside Expo Go.
//
// Why this dance:
//   1. Native Google sign-in (GoogleSignin SDK) requires custom native
//      modules → won't load in Expo Go.
//   2. So we use Supabase's web OAuth: get an auth URL from Supabase,
//      open it in an in-app browser, capture the redirect that comes
//      back with tokens, and hand those tokens to supabase.setSession.
//
// Redirect URL:
//   - In Expo Go: `makeRedirectUri` returns `exp://<lan-ip>:8081/--/...`
//   - In prod builds: returns `naambolo://...` (from app.json `scheme`)
//   Both must be added to Supabase → Authentication → URL Configuration
//   as allowed redirect URLs.
// Apple Sign In — native iOS flow. NO browser, NO redirect URL, NO
// p8 keys. The native dialog gives us an identity token that we pass
// straight to Supabase via signInWithIdToken. This is the
// Apple-recommended pattern for iOS apps and avoids the deep-link
// issues we hit with Google in Expo Go.
//
// Requires a TestFlight / standalone build — the
// expo-apple-authentication native module is not included in Expo Go.
export async function signInWithApple(): Promise<AuthResult> {
  if (Platform.OS !== 'ios') {
    return { ok: false, error: 'Apple Sign In is only available on iOS.' };
  }
  try {
    const available = await AppleAuthentication.isAvailableAsync();
    if (!available) {
      return { ok: false, error: 'Apple Sign In is not available on this device.' };
    }
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      return { ok: false, error: 'Apple did not return an identity token.' };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    // User cancelled the native sheet — surface as a friendly cancel
    // rather than an error.
    const code = (e as { code?: string }).code;
    if (code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, error: 'Sign-in cancelled.' };
    }
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    // makeRedirectUri() in Expo Go returns exp://<lan-ip>:8081/--/...
    // In standalone builds with scheme=naambolo, returns naambolo://...
    // Both need to be allow-listed in Supabase → URL Configuration.
    const redirectTo = makeRedirectUri({ scheme: 'naambolo' });
    console.log('[google] redirectTo:', redirectTo);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) return { ok: false, error: error.message };
    if (!data?.url) return { ok: false, error: 'Google sign-in did not start.' };
    console.log('[google] opening browser');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    console.log('[google] browser closed with type:', result.type);
    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { ok: false, error: 'Sign-in cancelled.' };
    }
    if (result.type !== 'success' || !result.url) {
      return { ok: false, error: 'Google sign-in failed to return.' };
    }
    return await createSessionFromUrl(result.url);
  } catch (e) {
    console.log('[google] threw:', e);
    return { ok: false, error: e instanceof Error ? e.message : 'Unexpected error.' };
  }
}

// Convert a Supabase session's user into our app's User type.
export function supabaseUserToAppUser(
  sbUser: { email?: string | null; user_metadata?: Record<string, unknown> } | null,
): User | null {
  if (!sbUser || !sbUser.email) return null;
  const meta = sbUser.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    sbUser.email.split('@')[0];
  return { name: fullName, email: sbUser.email };
}
