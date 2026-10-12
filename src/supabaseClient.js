import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// createClient throws on an invalid URL, which would crash the app on import.
// Only create the client once real credentials are configured in .env.
const hasValidConfig = /^https?:\/\//.test(supabaseUrl ?? '') && Boolean(supabaseAnonKey);

if (!hasValidConfig) {
    console.warn('Supabase is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = hasValidConfig ? createClient(supabaseUrl, supabaseAnonKey) : null;