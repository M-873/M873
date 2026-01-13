import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock } from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
}

const UpcomingFeature = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const fetchFeature = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        setFeature(data);
      }
      setLoading(false);
    };

    fetchFeature();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="w-10 h-10 text-primary" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
              {feature?.status || "Upcoming"}
            </div>
            <h1 className="text-2xl font-bold text-primary">
              {feature?.title || "Upcoming Feature"}
            </h1>
            <p className="text-muted-foreground">
              {feature?.description || "This feature is not available yet. M873 is working on it."}
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingFeature;
