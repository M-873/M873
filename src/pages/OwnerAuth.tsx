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
import { sendOTPEmail } from "@/utils/emailService";

const OwnerAuth = () => {
  const navigate = useNavigate();
  const { isOwner, loading } = useOwnerAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState("mahfuzulislam873@gmail.com");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [generatedOtp] = useState("87345");
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const ALLOWED_EMAIL = "mahfuzulislam873@gmail.com";
  const ALLOWED_PASSWORD = "mahfugul873";

  useEffect(() => {
    console.log("OwnerAuth useEffect:", { loading, isOwner });
    if (!loading && isOwner) {
      console.log("Redirecting to dashboard because user is owner");
      navigate("/owner/dashboard");
    }
  }, [isOwner, loading, navigate]);

  // Test Supabase connection
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing Supabase connection...");
        console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
        console.log("Supabase Key exists:", !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
        
        const { data, error } = await supabase.from('features').select('id').limit(1);
        console.log("Supabase connection test:", { data, error });
        
        // Test auth
        const { data: authData, error: authError } = await supabase.auth.getSession();
        console.log("Auth session test:", { authData, authError });
      } catch (err) {
        console.error("Supabase connection failed:", err);
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timer]);

  const sendOTP = async () => {
    try {
      console.log(`Sending fake OTP ${generatedOtp} to ${email}...`);
      
      // Simulate OTP sending with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start 60-second timer
      setTimer(60);
      setTimerActive(true);
      
      console.log("Fake OTP sent successfully");
      toast.success("OTP sent to your email!");
      setShowOtp(true);
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error("Failed to send OTP");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Owner login attempt:", { email, password, showOtp, otp });
      
      if (email !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
        console.log("Invalid credentials:", { email: email !== ALLOWED_EMAIL, password: password !== ALLOWED_PASSWORD });
        toast.error("Invalid owner credentials");
        return;
      }

      if (!showOtp) {
        // First step: Send OTP
        console.log("Sending OTP...");
        await sendOTP();
        setIsLoading(false);
        return;
      }

      // Second step: Verify fake OTP
      console.log("Verifying fake OTP:", { enteredOtp: otp, expectedOtp: generatedOtp });
      
      if (otp !== generatedOtp) {
        console.log("OTP mismatch");
        toast.error("Invalid OTP");
        return;
      }
      
      // Check if timer is still active
      if (!timerActive || timer <= 0) {
        console.log("OTP expired");
        toast.error("OTP has expired");
        return;
      }

      console.log("Attempting Supabase signin...");
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("Supabase signin result:", { data, error });

      if (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log("Signin error:", msg);
        if (msg.toLowerCase().includes("invalid login credentials")) {
          console.log("Attempting signup...");
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

      console.log("Checking user role for:", data.user.id);
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "owner")
        .maybeSingle();

      console.log("Role check result:", roleData);

      if (!roleData) {
        console.log("No owner role found, checking if allowed email...");
        // If no role data but it's the allowed email, create the owner role
        if (email === ALLOWED_EMAIL) {
          console.log("Creating owner role for allowed email...");
          try {
            const { error: roleError } = await supabase
              .from("user_roles")
              .insert({ user_id: data.user.id, role: "owner" });
            
            if (roleError) {
              console.error("Error creating owner role:", roleError);
              toast.error("Failed to create owner role");
              return;
            }
            console.log("Owner role created successfully");
          } catch (roleErr) {
            console.error("Error creating owner role:", roleErr);
            toast.error("Failed to create owner role");
            return;
          }
        } else {
          console.log("Access denied - not an owner");
          try {
            await supabase.auth.signOut({ scope: 'local' });
          } catch (signOutError) {
            console.error("SignOut error during access denial:", signOutError);
          }
          toast.error("Access denied. You are not an owner.");
          return;
        }
      }

      toast.success("Signed in as owner!");
      navigate("/owner/dashboard");
    } catch (error) {
      console.error("Owner login error:", error);
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
            <Logo className="w-12 h-12" colorMode="rainbow" blink={true} />
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
              {!showOtp ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter owner password"
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 5-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={5}
                      pattern="[0-9]{5}"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        Check your email for the code
                      </p>
                      {timerActive && (
                        <p className="text-xs text-primary font-medium">
                          {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading || !timerActive}>
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setShowOtp(false);
                      setOtp("");
                      setTimerActive(false);
                      setTimer(0);
                    }}
                  >
                    Back
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerAuth;
