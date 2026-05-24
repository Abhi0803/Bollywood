// Supabase client — single source of truth for auth + future DB calls.
//
// Storage adapter notes:
//   - Uses expo-secure-store (iOS Keychain / Android Keystore) for the
//     auth token. Auth tokens are the kind of thing that absolutely
//     should NOT live in plain disk JSON. SecureStore has a 2048-byte
//     limit per item, and Supabase tokens fit comfortably.
//   - We tried AsyncStorage earlier in the project and hit upstream Metro
//     bundler issues, so we're using SecureStore instead.
//
// Env vars (in app/.env, gitignored):
//   EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
// EXPO_PUBLIC_* vars get inlined into the JS bundle. The publishable
// key is designed to be public-facing — security comes from Supabase
// Row-Level Security policies, not from hiding the key.

import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase credentials missing. Create app/.env with EXPO_PUBLIC_SUPABASE_URL ' +
      'and EXPO_PUBLIC_SUPABASE_ANON_KEY (from your project dashboard → Settings → API Keys).',
  );
}

// Storage adapter wrapping SecureStore in the synchronous-style API
// Supabase's auth module expects.
const secureStorageAdapter = {
  async getItem(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* best-effort */
    }
  },
  async removeItem(key: string) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* best-effort */
    }
  },
};

const options: SupabaseClientOptions<'public'> = {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    // OAuth deep-link redirects are handled by the LoginScreen with
    // Linking; we don't need the URL-parsing here on native.
    detectSessionInUrl: false,
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);
