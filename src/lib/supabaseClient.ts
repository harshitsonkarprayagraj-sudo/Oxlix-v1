import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

function getConfigurationError(url: string | undefined, key: string | undefined): string | null {
  if (!url || !key) return 'Supabase configuration is missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.';

  try {
    const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.exp === 'number' && payload.exp <= Math.floor(Date.now() / 1000)) {
      return 'The Supabase anon key has expired. Replace VITE_SUPABASE_ANON_KEY with the current publishable key.';
    }
  } catch {
    return 'The Supabase anon key is not a valid JWT.';
  }

  return null;
}

export const configurationError = getConfigurationError(supabaseUrl, supabaseAnonKey);

if (configurationError) {
  console.error(
    configurationError
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'oxlix-auth-session',
    },
  }
);

export const isConfigured = !configurationError;
