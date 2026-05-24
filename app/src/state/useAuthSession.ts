// Subscribes to Supabase auth state and surfaces the current user as a hook.
// Loads the persisted session on mount so a logged-in user lands on Home
// without re-doing the Login screen.

import { useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';
import { supabaseUserToAppUser } from './auth';
import type { User } from './types';

export type AuthStatus = 'loading' | 'signed-out' | 'signed-in';

export function useAuthSession(): { status: AuthStatus; user: User | null } {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 1) Hydrate from any persisted session that SecureStore is holding.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const sbUser = data.session?.user ?? null;
      const appUser = supabaseUserToAppUser(sbUser);
      setUser(appUser);
      setStatus(appUser ? 'signed-in' : 'signed-out');
    });

    // 2) Listen for subsequent changes (sign-in, sign-out, token refresh).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sbUser = session?.user ?? null;
      const appUser = supabaseUserToAppUser(sbUser);
      setUser(appUser);
      setStatus(appUser ? 'signed-in' : 'signed-out');
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { status, user };
}
