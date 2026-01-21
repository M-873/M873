import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeSignOut } from "@/lib/auth-helpers";
import { toast } from "sonner";
import { ArrowLeft, Shield, Github } from "lucide-react";
import Logo from "@/components/Logo";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import { generateOTP, verifyOTP } from "@/utils/otpServiceFallback";

const OwnerAuth = () => {
  const navigate = useNavigate();
  const { isOwner, loading } = useOwnerAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState("mahfuzulislam873@gmail.com");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [lastGeneratedOTP, setLastGeneratedOTP] = useState<string>("");
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
      setIsLoading(true);
      console.log(`Sending real OTP to ${email}...`);
      
      // Generate and send OTP using the new service
      const result = await generateOTP(email);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate OTP');
      }
      
      console.log("OTP generated successfully:", result);
      
      // Store the OTP for display
      if (result.otp) {
        setLastGeneratedOTP(result.otp);
      }
      
      // Start 60-second timer
      setTimer(60);
      setTimerActive(true);
      
      toast.success("OTP sent to your email!");
      setShowOtp(true);
      
    } catch (error) {
      console.error("Failed to send OTP:", error);
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Password verification attempt:", { email, password });
      
      if (email !== ALLOWED_EMAIL || password !== ALLOWED_PASSWORD) {
        console.log("Invalid credentials:", { email: email !== ALLOWED_EMAIL, password: password !== ALLOWED_PASSWORD });
        toast.error("Invalid owner credentials");
        return;
      }

      // Password is correct, now send OTP
      console.log("Password verified, sending OTP...");
      await sendOTP();
      setPasswordVerified(true);
      
    } catch (error) {
      console.error("Password verification error:", error);
      const message = error instanceof Error ? error.message : "Failed to verify password";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("OTP verification attempt:", { email, otp });
      
      if (!passwordVerified) {
        toast.error("Please verify password first");
        return;
      }

      // Verify real OTP
      console.log("Verifying real OTP:", { enteredOtp: otp });
      
      const verifyResult = await verifyOTP(email, otp);
      
      if (!verifyResult.success) {
        console.log("OTP verification failed:", verifyResult.error);
        toast.error(verifyResult.error || "Invalid OTP");
        return;
      }
      
      // Check if timer is still active
      if (!timerActive || timer <= 0) {
        console.log("OTP expired");
        toast.error("OTP has expired");
        return;
      }

      console.log("OTP verified successfully, attempting Supabase signin...");
      
      // Try Supabase auth with fallback for invalid API key
      let data: any = null;
      let error: any = null;
      
      try {
        const result = await supabase.auth.signInWithPassword({
          email,
          password: ALLOWED_PASSWORD,
        });
        data = result.data;
        error = result.error;
      } catch (authError) {
        console.warn("Supabase auth failed, using development fallback:", authError);
        
        // Fallback: Create a mock session for development
        if (email === ALLOWED_EMAIL) {
          console.log("Using development fallback for owner authentication");
          data = {
            user: {
              id: "dev-owner-" + Date.now(),
              email: email,
              app_metadata: { provider: "email" },
              user_metadata: {},
              aud: "authenticated",
              created_at: new Date().toISOString(),
            },
            session: {
              access_token: "dev-token-" + Date.now(),
              refresh_token: "dev-refresh-" + Date.now(),
              expires_in: 3600,
              expires_at: Date.now() + 3600000,
              token_type: "bearer",
              user: {
                id: "dev-owner-" + Date.now(),
                email: email,
                app_metadata: { provider: "email" },
                user_metadata: {},
                aud: "authenticated",
                created_at: new Date().toISOString(),
              },
            }
          };
          error = null;
        } else {
          throw new Error("Authentication failed: Invalid API key or credentials");
        }
      }

      console.log("Authentication result:", { data, error });

      if (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log("Signin error:", msg);
        if (msg.toLowerCase().includes("invalid login credentials")) {
          console.log("Attempting signup...");
          try {
            const { error: signupError } = await supabase.auth.signUp({
              email,
              password: ALLOWED_PASSWORD,
            });
            if (signupError) {
              throw signupError;
            }
            const result = await supabase.auth.signInWithPassword({
              email,
              password: ALLOWED_PASSWORD,
            });
            data = result.data;
            error = result.error;
            if (error) throw error;
          } catch (signupError) {
            console.warn("Signup also failed, using development fallback");
            if (email === ALLOWED_EMAIL) {
              data = {
                user: {
                  id: "dev-owner-" + Date.now(),
                  email: email,
                  app_metadata: { provider: "email" },
                  user_metadata: {},
                  aud: "authenticated",
                  created_at: new Date().toISOString(),
                },
                session: {
                  access_token: "dev-token-" + Date.now(),
                  refresh_token: "dev-refresh-" + Date.now(),
                  expires_in: 3600,
                  expires_at: Date.now() + 3600000,
                  token_type: "bearer",
                  user: {
                    id: "dev-owner-" + Date.now(),
                    email: email,
                    app_metadata: { provider: "email" },
                    user_metadata: {},
                    aud: "authenticated",
                    created_at: new Date().toISOString(),
                  },
                }
              };
              error = null;
            } else {
              throw signupError;
            }
          }
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
            await safeSignOut();
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

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      console.log("Starting GitHub OAuth login...");
      
      // Attempt GitHub OAuth login
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/owner/auth`,
          scopes: 'read:user user:email'
        }
      });
      
      if (error) {
        console.error("GitHub OAuth error:", error);
        toast.error(`GitHub login failed: ${error.message}`);
        return;
      }
      
      console.log("GitHub OAuth initiated:", data);
      
      // The OAuth flow will redirect to GitHub, then back to our callback URL
      // The actual authentication will be handled in the callback
      
    } catch (error) {
      console.error("GitHub login error:", error);
      toast.error("Failed to initiate GitHub login");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we're returning from OAuth
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log("Processing OAuth callback...");
          
          // Get the current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error getting session from OAuth callback:", error);
            toast.error("Failed to complete GitHub login");
            return;
          }
          
          if (session?.user) {
            console.log("GitHub OAuth successful, checking owner role...", session.user);
            
            // Check if this is the owner email
            const userEmail = session.user.email;
            if (userEmail === ALLOWED_EMAIL) {
              // Check if owner role exists
              const { data: roleData } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id)
                .eq("role", "owner")
                .maybeSingle();
              
              if (!roleData) {
                // Create owner role
                console.log("Creating owner role for GitHub user...");
                const { error: roleError } = await supabase
                  .from("user_roles")
                  .insert({ user_id: session.user.id, role: "owner" });
                
                if (roleError) {
                  console.error("Error creating owner role:", roleError);
                  toast.error("Failed to create owner role");
                  return;
                }
              }
              
              toast.success("Signed in as owner via GitHub!");
              navigate("/owner/dashboard");
            } else {
              console.log("GitHub user is not the owner, signing out...");
              await safeSignOut();
              toast.error("Access denied. GitHub account is not authorized as owner.");
            }
          }
        }
      } catch (error) {
        console.error("OAuth callback error:", error);
        toast.error("Failed to process GitHub login");
      }
    };
    
    handleOAuthCallback();
  }, []); // Run once on component mount

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
            <form onSubmit={!passwordVerified ? handlePasswordVerification : handleSignIn} className="space-y-4">
              {!passwordVerified ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Owner Password</Label>
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
                    {isLoading ? "Verifying..." : "Verify Password"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleGitHubLogin}
                    disabled={isLoading}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    {isLoading ? "Connecting..." : "Login with GitHub"}
                  </Button>
                </>
              ) : !showOtp ? (
                <>
                  <div className="text-center space-y-2">
                    <p className="text-sm text-muted-foreground">Password verified!</p>
                    <p className="text-sm text-muted-foreground">Click the button below to receive OTP</p>
                  </div>
                  <Button type="button" className="w-full" onClick={sendOTP} disabled={isLoading}>
                    {isLoading ? "Sending OTP..." : "Send OTP to Email"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setPasswordVerified(false);
                      setPassword("");
                    }}
                  >
                    Back to Password
                  </Button>
                </>
              ) : (
                <>
                  {lastGeneratedOTP && (
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">Your OTP Code:</p>
                        <p className="text-2xl font-bold text-primary tracking-wider">{lastGeneratedOTP}</p>
                        <p className="text-xs text-muted-foreground mt-2">This code is also sent to your email</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
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
                      setLastGeneratedOTP("");
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