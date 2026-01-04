import { supabase } from './supabaseClient';

export const isAllowed = async (email: string): Promise<boolean> => {
  if (!email) return false;

  // Eternal access for admin
  if (email.toLowerCase() === 'dreknows@gmail.com') {
    return true;
  }

  if (!supabase) {
    console.warn('Supabase client is not initialized. Cannot verify membership.');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('Supabase membership check error:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Unexpected error during membership check:', err);
    return false;
  }
};