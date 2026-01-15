import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, User, Mail, CheckCircle, AlertCircle } from "lucide-react";
import Logo from "@/components/Logo";
import { toast } from "sonner";

const OAuthConsent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  
  // OAuth parameters
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const scope = searchParams.get('scope');
  const state = searchParams.get('state');
  const responseType = searchParams.get('response_type');

  useEffect(() => {
    // Validate required OAuth parameters
    if (!clientId || !redirectUri || !scope) {
      toast.error("Invalid OAuth request: missing required parameters");
      return;
    }

    // Validate redirect URI format
    try {
      new URL(redirectUri);
    } catch {
      toast.error("Invalid redirect URI");
      return;
    }
  }, [clientId, redirectUri, scope]);

  const handleAllow = async () => {
    if (!consentGiven) {
      toast.error("Please consent to the requested permissions");
      return;
    }

    setLoading(true);
    
    try {
      // Generate authorization code
      const authCode = generateAuthCode();
      
      // Build redirect URL with authorization code
      const redirectUrl = new URL(redirectUri!);
      redirectUrl.searchParams.set('code', authCode);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      
      // Redirect back to the client
      window.location.href = redirectUrl.toString();
    } catch (error) {
      toast.error("Failed to process authorization");
      setLoading(false);
    }
  };

  const handleDeny = () => {
    if (redirectUri) {
      const redirectUrl = new URL(redirectUri);
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('error_description', 'User denied authorization');
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      window.location.href = redirectUrl.toString();
    }
  };

  const generateAuthCode = () => {
    return 'auth_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const parseScopes = (scopeString: string) => {
    return scopeString.split(' ').map(scope => {
      switch (scope) {
        case 'read':
          return { key: 'read', label: 'Read your profile information', description: 'Access your basic profile data including name and email' };
        case 'write':
          return { key: 'write', label: 'Update your profile information', description: 'Modify your profile data and settings' };
        case 'admin':
          return { key: 'admin', label: 'Administrative access', description: 'Full administrative control over your account' };
        case 'features':
          return { key: 'features', label: 'Access upcoming features', description: 'View and interact with upcoming features' };
        default:
          return { key: scope, label: scope, description: `Access ${scope} resources` };
      }
    });
  };

  if (!clientId || !redirectUri || !scope) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <CardTitle>Invalid OAuth Request</CardTitle>
            <CardDescription>
              The authorization request is missing required parameters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
              variant="outline"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scopes = parseScopes(scope);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Logo className="w-16 h-16" />
          </div>
          <CardTitle className="text-2xl">
            Authorization Request
          </CardTitle>
          <CardDescription>
            An application is requesting access to your M873 account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Application Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{clientId}</h3>
                <p className="text-sm text-muted-foreground">Application requesting access</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{redirectUri}</span>
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">This application will be able to:</h3>
            </div>
            
            <div className="space-y-3">
              {scopes.map((scopeItem) => (
                <div key={scopeItem.key} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">{scopeItem.label}</p>
                    <p className="text-sm text-muted-foreground">{scopeItem.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
            />
            <Label htmlFor="consent" className="cursor-pointer">
              I understand and consent to these permissions
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDeny}
              className="flex-1"
              disabled={loading}
            >
              Deny
            </Button>
            <Button
              onClick={handleAllow}
              className="flex-1"
              disabled={loading || !consentGiven}
            >
              {loading ? "Authorizing..." : "Allow"}
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/profile')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Review your account settings
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthConsent;