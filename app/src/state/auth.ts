// Auth wrapper around Supabase — narrows supabase-js's broader API into
// the handful of methods our LoginScreen actually calls.
//
// All methods return `{ ok: boolean; error?: string }` so the UI doesn't
// need to know about Supabase's response shape.

import { supabase } from '../lib/supabase';
import type { User } from './types';

export type AuthResult = { ok: boolean; error?: string };

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
