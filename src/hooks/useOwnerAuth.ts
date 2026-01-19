import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useOwnerAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role check
        if (session?.user) {
          setTimeout(() => {
            checkOwnerRole(session.user.id, session.user.email);
          }, 0);
        } else {
          setIsOwner(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkOwnerRole(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkOwnerRole = async (userId: string, userEmail?: string) => {
    try {
      console.log("[useOwnerAuth] Checking owner role for userId:", userId, "email:", userEmail);
      
      // Check if user has the allowed email
      const ALLOWED_EMAIL = "mahfuzulislam873@gmail.com";
      if (userEmail === ALLOWED_EMAIL) {
        console.log("[useOwnerAuth] User has allowed email, considering as owner");
        setIsOwner(true);
        setLoading(false);
        return;
      }
      
      console.log("[useOwnerAuth] Email check failed, querying user_roles table");
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "owner")
        .maybeSingle();

      console.log("[useOwnerAuth] Owner role check result:", { data, error });

      if (error) {
        console.error("[useOwnerAuth] Error checking owner role:", error);
        setIsOwner(false);
      } else {
        console.log("[useOwnerAuth] Setting isOwner based on data:", !!data);
        setIsOwner(!!data);
      }
    } catch (error) {
      console.error("[useOwnerAuth] Exception in checkOwnerRole:", error);
      setIsOwner(false);
    } finally {
      console.log("[useOwnerAuth] Finished checkOwnerRole, setting loading to false");
      setLoading(false);
    }
  };

  return { user, session, isOwner, loading };
};
