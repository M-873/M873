import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Shield } from "lucide-react";
import Logo from "@/components/Logo";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";

const OwnerAuth = () => {
  const navigate = useNavigate();
  const { isOwner, loading } = useOwnerAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("mahfuzulislam873@gmail.com");
  const [password, setPassword] = useState("mahfugul873");
  const ALLOWED_EMAIL = "mahfuzulislam873@gmail.com";
  const ALLOWED_PASSWORD = "mahfugul873";

  useEffect(() => {
    if (!loading && isOwner) {
      navigate("/owner/dashboard");
    }
  }, [isOwner, loading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (email !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
        toast.error("Invalid owner credentials");
        setIsLoading(false);
        return;
      }

      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = error instanceof Error ? error.message : String(error);
        if (msg.toLowerCase().includes("invalid login credentials")) {
          const { error: signupError } = await supabase.auth.signUp({
            email,
            password,
          });
          if (signupError) {
            throw signupError;
          }
          const result = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          data = result.data;
          error = result.error;
          if (error) throw error;
        } else {
          throw error;
        }
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "owner")
        .maybeSingle();

      if (!roleData && email !== ALLOWED_EMAIL) {
        await supabase.auth.signOut();
        toast.error("Access denied. You are not an owner.");
        return;
      }

      toast.success("Signed in as owner!");
      navigate("/owner/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo className="w-12 h-12" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Owner Access</h1>
          </div>
          <p className="text-muted-foreground">Sign in to manage M873</p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-center text-lg">Owner Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerAuth;