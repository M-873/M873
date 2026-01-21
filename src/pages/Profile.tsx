import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, Calendar, User as UserIcon, LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Check auth status and get user info (optional for public viewing)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserEmail(session.user.email || "");
        setCreatedAt(new Date(session.user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }));
        // Check if user is owner
        if (session.user.email === "mahfuzulislam873@gmail.com") {
          setIsOwner(true);
        }
      }
    });
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('SignOut error:', error);
        throw error;
      }
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to log out");
      // Force navigation even if signOut fails
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-primary">M873 Profile</h1>
            <p className="text-sm text-muted-foreground">About this platform</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Platform</span>
              </div>
              <p className="font-medium text-foreground">M873 Feature Management System</p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="w-4 h-4" />
                <span>Access Level</span>
              </div>
              <p className="font-medium text-foreground">
                {userEmail ? (isOwner ? "Owner" : "User") : "Public Visitor"}
              </p>
            </div>

            {userEmail && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </div>
                <p className="font-medium text-foreground">{userEmail}</p>
              </div>
            )}

            {createdAt && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Account Created</span>
                </div>
                <p className="font-medium text-foreground">{createdAt}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              View Features
              Back to Dashboard
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
