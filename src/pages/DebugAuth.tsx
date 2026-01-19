import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DebugAuth = () => {
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    debugAuthFlow();
  }, []);

  const debugAuthFlow = async () => {
    try {
      setIsLoading(true);
      setErrors([]);
      
      // Step 1: Check current session
      console.log("[DebugAuth] Step 1: Checking session...");
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      setSession(currentSession);
      setUser(currentSession?.user);
      setAuthStatus(currentSession?.user ? "Authenticated" : "Not authenticated");
      
      console.log("[DebugAuth] Session status:", {
        hasSession: !!currentSession,
        hasUser: !!currentSession?.user,
        userEmail: currentSession?.user?.email
      });

      // Step 2: Test user_roles table access
      console.log("[DebugAuth] Step 2: Testing user_roles table...");
      try {
        const { data: rolesData, error: rolesError } = await supabase
          .from("user_roles")
          .select("*");
        
        if (rolesError) {
          throw new Error(`User roles error: ${rolesError.message}`);
        }
        
        setUserRoles(rolesData || []);
        console.log("[DebugAuth] User roles found:", rolesData?.length || 0);
      } catch (error: any) {
        console.error("[DebugAuth] User roles access failed:", error);
        setErrors(prev => [...prev, `User roles: ${error.message}`]);
      }

      // Step 3: Test features table access
      console.log("[DebugAuth] Step 3: Testing features table...");
      try {
        const { data: featuresData, error: featuresError } = await supabase
          .from("features")
          .select("*");
        
        if (featuresError) {
          throw new Error(`Features error: ${featuresError.message}`);
        }
        
        setFeatures(featuresData || []);
        console.log("[DebugAuth] Features found:", featuresData?.length || 0);
      } catch (error: any) {
        console.error("[DebugAuth] Features access failed:", error);
        setErrors(prev => [...prev, `Features: ${error.message}`]);
      }

      // Step 4: Test with different auth levels
      if (currentSession?.user) {
        console.log("[DebugAuth] Step 4: Testing with authenticated user...");
        
        // Test user_roles with user ID filter
        try {
          const { data: userRolesData, error: userRolesError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", currentSession.user.id);
          
          if (userRolesError) {
            throw new Error(`User-specific roles error: ${userRolesError.message}`);
          }
          
          console.log("[DebugAuth] User-specific roles found:", userRolesData?.length || 0);
        } catch (error: any) {
          console.error("[DebugAuth] User-specific roles failed:", error);
          setErrors(prev => [...prev, `User roles (specific): ${error.message}`]);
        }
      }

    } catch (error: any) {
      console.error("[DebugAuth] Fatal error:", error);
      setAuthStatus("Error");
      setErrors(prev => [...prev, `Fatal: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const testOwnerAccess = async () => {
    try {
      // Test the exact query from useOwnerAuth
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id || "00000000-0000-0000-0000-000000000000")
        .eq("role", "owner")
        .maybeSingle();

      if (error) {
        toast.error(`Owner check failed: ${error.message}`);
      } else {
        toast.success(`Owner check result: ${data ? 'IS OWNER' : 'NOT OWNER'}`);
      }
    } catch (error: any) {
      toast.error(`Owner check error: ${error.message}`);
    }
  };

  const addTestOwnerRole = async () => {
    try {
      if (!user?.id) {
        toast.error("No user logged in");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .insert({
          user_id: user.id,
          role: "owner"
        });

      if (error) {
        toast.error(`Failed to add owner role: ${error.message}`);
      } else {
        toast.success("Owner role added successfully!");
        debugAuthFlow(); // Refresh the data
      }
    } catch (error: any) {
      toast.error(`Error adding owner role: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Debug Authentication</h1>
      
      <div className="grid gap-6">
        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Status:</strong> {authStatus}</p>
              <p><strong>User Email:</strong> {user?.email || "None"}</p>
              <p><strong>User ID:</strong> {user?.id?.substring(0, 8) || "None"}...</p>
              <p><strong>Loading:</strong> {isLoading ? "Yes" : "No"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Errors */}
        {errors.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-red-600">{error}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Database Access Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>User Roles Found:</strong> {userRoles.length}</p>
              <p><strong>Features Found:</strong> {features.length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={debugAuthFlow} disabled={isLoading}>
                Refresh Data
              </Button>
              <Button onClick={testOwnerAccess} variant="outline">
                Test Owner Check
              </Button>
              <Button onClick={addTestOwnerRole} variant="outline" disabled={!user?.id}>
                Add Owner Role
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Raw Data */}
        <Card>
          <CardHeader>
            <CardTitle>Raw Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">User Roles:</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-32">
                  {JSON.stringify(userRoles, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Features (first 2):</h4>
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-32">
                  {JSON.stringify(features.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuth;