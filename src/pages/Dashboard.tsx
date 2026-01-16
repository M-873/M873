import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import Logo from "@/components/Logo";

interface Feature {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  sort_order: number | null;
  link: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data, error } = await supabase
        .from("features")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && data) {
        setFeatures(data);
      }
      setLoading(false);
    };

    fetchFeatures();
  }, []);
  return <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-accent/5">
        {/* Sidebar */}
        <Sidebar className="border-r border-white/10 bg-gradient-to-b from-navDark to-navBlue">
          <div className="p-4 border-b border-white/10 bg-secondary-foreground">
            <div className="flex items-center gap-3 bg-secondary-foreground text-secondary-foreground">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="hover:bg-white/10 h-8 w-8">
                <ArrowLeft className="w-4 h-4 text-white" />
              </Button>
              <Logo className="w-8 h-8" colorMode="ocean" />
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent bg-secondary-foreground">M873</span>
            </div>
          </div>
          
          <SidebarContent className="bg-secondary-foreground">
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-sm">Features</SidebarGroupLabel>
              <SidebarGroupContent>
              <SidebarMenu className="border-primary">
                  {features.map(feature => <SidebarMenuItem key={feature.id}>
                      <SidebarMenuButton asChild>
                        <NavLink to={`/upcoming/${feature.id}`} className="text-white/80 hover:text-white hover:bg-white/10 text-base" activeClassName="bg-white/20 text-white">
                          <span>{feature.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <header className="border-b border-white/10 bg-gradient-to-r from-navDark to-navBlue backdrop-blur-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-white hover:bg-white/10" />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">Welcome back!</h2>
                <p className="text-muted-foreground">
                  Explore upcoming features and stay tuned for updates.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(feature => <Card key={feature.id} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {feature.status || "Upcoming"}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description || "This feature will be added soon."}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => {
                          if (feature.link) {
                            window.open(feature.link, '_blank', 'noopener,noreferrer');
                          } else {
                            navigate(`/upcoming/${feature.id}`);
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
};
export default Dashboard;
