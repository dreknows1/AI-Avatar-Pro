
import { createClient } from '@supabase/supabase-js';

// Shared Supabase project credentials
const supabaseUrl = 'https://xanhyaugfbbrjlduyxmm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhbmh5YXVnZmJicmpsZHV5eG1tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMTg5ODMsImV4cCI6MjA3Nzg5NDk4M30.hX6vGDy5dztqBBjV5mtzx_A_O4J2lvwnfefxNDjqbvM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
