
import { supabase } from './supabaseClient';

export const isAllowed = async (email: string): Promise<boolean> => {
  if (!email) return false;

  const lowerEmail = email.toLowerCase();
  
  // Eternal access for admin
  if (lowerEmail === 'dreknows@gmail.com') {
    return true;
  }

  if (!supabase) {
    console.warn('Supabase client is not initialized.');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('id')
      .eq('email', lowerEmail)
      .maybeSingle();

    if (error) {
      console.error('Membership check error:', error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Unexpected membership check error:', err);
    return false;
  }
};
