
import { createClient } from '@supabase/supabase-js';

// Use environment variables exposed via Vite to ensure project isolation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
