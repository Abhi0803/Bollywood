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

// Chunked SecureStore adapter. SecureStore has a ~2KB per-item limit on
// iOS, but Google/Apple OAuth sessions blow past that (3-5KB once you
// add provider tokens + JWT claims). We split the value across as many
// `${key}.chunk.N` items as needed, and remember the chunk count at
// `${key}.meta`.
const CHUNK_SIZE = 1800;

async function setChunked(key: string, value: string) {
  const meta = await SecureStore.getItemAsync(`${key}.meta`);
  const oldCount = meta ? parseInt(meta, 10) || 0 : 0;

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(`${key}.chunk.${i}`, chunks[i]);
  }
  await SecureStore.setItemAsync(`${key}.meta`, String(chunks.length));

  // Clear any leftover chunks from a previous (larger) write.
  for (let i = chunks.length; i < oldCount; i++) {
    await SecureStore.deleteItemAsync(`${key}.chunk.${i}`);
  }
}

async function getChunked(key: string): Promise<string | null> {
  // Back-compat: if a non-chunked legacy value exists, return it.
  const legacy = await SecureStore.getItemAsync(key);
  if (legacy !== null) return legacy;

  const meta = await SecureStore.getItemAsync(`${key}.meta`);
  if (!meta) return null;
  const count = parseInt(meta, 10) || 0;
  if (count === 0) return null;
  let out = '';
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(`${key}.chunk.${i}`);
    if (part === null) return null;
    out += part;
  }
  return out;
}

async function removeChunked(key: string) {
  await SecureStore.deleteItemAsync(key);
  const meta = await SecureStore.getItemAsync(`${key}.meta`);
  const count = meta ? parseInt(meta, 10) || 0 : 0;
  for (let i = 0; i < count; i++) {
    await SecureStore.deleteItemAsync(`${key}.chunk.${i}`);
  }
  await SecureStore.deleteItemAsync(`${key}.meta`);
}

const secureStorageAdapter = {
  async getItem(key: string) {
    try {
      return await getChunked(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string) {
    try {
      await setChunked(key, value);
    } catch {
      /* best-effort */
    }
  },
  async removeItem(key: string) {
    try {
      await removeChunked(key);
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
