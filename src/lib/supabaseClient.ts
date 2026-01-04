
import { createClient } from '@supabase/supabase-js';

// Use environment variables exposed via Vite to ensure project isolation
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing from environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
