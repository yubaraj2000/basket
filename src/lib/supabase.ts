import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

/**
 * The connection to our Supabase project.
 *
 * The URL and publishable key live in .env.local (not committed). Both are meant to be
 * public: what keeps each household's list private is row level security in the database
 * (see supabase/migrations). Never put the database password or a secret key in the app.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    'Missing Supabase settings. Copy .env.example to .env.local and fill in the two values.'
  );
}

// On the web, code can also run outside a browser (for example while pre-rendering pages),
// where there is no `window` and nothing to save a sign-in to.
const inBrowserOrApp = Platform.OS !== 'web' || typeof window !== 'undefined';

export const supabase = createClient(url, key, {
  auth: {
    // Keep the sign-in on the phone so it survives closing the app.
    // AsyncStorage works on Android, iOS and the web version.
    storage: inBrowserOrApp ? AsyncStorage : undefined,
    autoRefreshToken: inBrowserOrApp,
    persistSession: inBrowserOrApp,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

/** Make sure this phone is signed in. The first time, it creates an anonymous user (no email, no password). */
export async function ensureSignedIn(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    return data.session.user.id;
  }
  const { data: signIn, error } = await supabase.auth.signInAnonymously();
  if (error || !signIn.user) {
    throw new Error(error?.message ?? 'Could not sign in');
  }
  return signIn.user.id;
}
