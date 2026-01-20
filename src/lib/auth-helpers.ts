import { supabase } from "@/integrations/supabase/client";

export const safeSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    return { success: true };
  } catch (error) {
    console.error('Safe sign out failed:', error);
    return { success: false, error };
  }
};