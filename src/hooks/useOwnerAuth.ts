import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useOwnerAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log("[useOwnerAuth] Auth state changed:", event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role check to ensure session is fully established
        if (session?.user) {
          setTimeout(() => {
            if (isMounted) {
              checkOwnerRole(session.user.id, session.user.email);
            }
          }, 100); // Small delay to ensure session is stable
        } else {
          setIsOwner(false);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      
      console.log("[useOwnerAuth] Initial session check:", session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Add small delay to ensure session is stable
        setTimeout(() => {
          if (isMounted) {
            checkOwnerRole(session.user.id, session.user.email);
          }
        }, 100);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      if (!isMounted) return;
      console.error("[useOwnerAuth] Error getting session:", error);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkOwnerRole = async (userId: string, userEmail?: string) => {
    try {
      console.log("[useOwnerAuth] Checking owner role for userId:", userId, "email:", userEmail);
      
      // Check if user has the allowed email first (no DB query needed)
      const ALLOWED_EMAIL = "mahfuzulislam873@gmail.com";
      if (userEmail === ALLOWED_EMAIL) {
        console.log("[useOwnerAuth] User has allowed email, considering as owner");
        setIsOwner(true);
        setLoading(false);
        return;
      }
      
      console.log("[useOwnerAuth] Email check failed, querying user_roles table");
      
      // Only query user_roles if we have a valid user ID
      if (!userId) {
        console.log("[useOwnerAuth] No user ID provided, cannot check roles");
        setIsOwner(false);
        setLoading(false);
        return;
      }
      
      try {
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
      } catch (dbError: any) {
        // Handle database-specific errors (like PGRST205)
        if (dbError.code === 'PGRST205') {
          console.error("[useOwnerAuth] Table not found error, treating as not owner");
          setIsOwner(false);
        } else {
          console.error("[useOwnerAuth] Database error:", dbError);
          setIsOwner(false);
        }
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
