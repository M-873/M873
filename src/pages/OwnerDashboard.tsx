import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Users, LayoutGrid, LogOut, Shield, Database, Search } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { DatasetParser, QAData } from "@/utils/datasetParser";

interface Feature {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  sort_order: number | null;
  link: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  email: string;
  created_at: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { user, isOwner, loading } = useOwnerAuth();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Feature form state
  const [featureTitle, setFeatureTitle] = useState("");
  const [featureDescription, setFeatureDescription] = useState("");
  const [featureLink, setFeatureLink] = useState("");
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  
  // Dataset management state
  const [datasetParser, setDatasetParser] = useState<DatasetParser | null>(null);
  const [datasetStats, setDatasetStats] = useState<{ total: number; english: number; bengali: number } | null>(null);
  const [datasetSearch, setDatasetSearch] = useState("");
  const [datasetSearchResults, setDatasetSearchResults] = useState<QAData[]>([]);
  const [isDatasetLoading, setIsDatasetLoading] = useState(false);

  useEffect(() => {
    if (!loading && !isOwner) {
      toast.error("Access denied. Owners only.");
      navigate("/owner/login");
    }
  }, [loading, isOwner, navigate]);

  useEffect(() => {
    if (isOwner) {
      fetchData();
      loadDataset();
    }
  }, [isOwner]);

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from("features")
        .select("*")
        .order("sort_order", { ascending: true });

      if (featuresError) throw featuresError;
      setFeatures(featuresData || []);

      // Fetch profiles (all users)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;
      setUserRoles(rolesData || []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadDataset = async () => {
    setIsDatasetLoading(true);
    try {
      const { loadDataset } = await import("@/utils/datasetParser");
      const parser = await loadDataset();
      if (parser) {
        setDatasetParser(parser);
        setDatasetStats(parser.getStats());
      }
    } catch (error) {
      toast.error("Failed to load dataset");
    } finally {
      setIsDatasetLoading(false);
    }
  };

  const handleDatasetSearch = () => {
    if (!datasetParser || !datasetSearch.trim()) {
      setDatasetSearchResults([]);
      return;
    }
    
    const results = datasetParser.searchDataset(datasetSearch);
    setDatasetSearchResults(results);
  };

  const handleSaveFeature = async () => {
    if (!featureTitle.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      if (editingFeature) {
        const { error } = await supabase
          .from("features")
          .update({
            title: featureTitle,
            description: featureDescription || null,
            link: featureLink || null,
          })
          .eq("id", editingFeature.id);

        if (error) throw error;
        toast.success("Feature updated!");
      } else {
        const maxOrder = features.length > 0 ? Math.max(...features.map(f => f.sort_order || 0)) : 0;
        const { error } = await supabase
          .from("features")
          .insert({
            title: featureTitle,
            description: featureDescription || null,
            link: featureLink || null,
            sort_order: maxOrder + 1,
          });

        if (error) throw error;
        toast.success("Feature added!");
      }

      setFeatureTitle("");
      setFeatureDescription("");
      setFeatureLink("");
      setEditingFeature(null);
      setIsFeatureDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save feature");
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature?")) return;

    try {
      const { error } = await supabase.from("features").delete().eq("id", id);
      if (error) throw error;
      toast.success("Feature deleted!");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete feature");
    }
  };

  const openEditDialog = (feature: Feature) => {
    setEditingFeature(feature);
    setFeatureTitle(feature.title);
    setFeatureDescription(feature.description || "");
    setFeatureLink(feature.link || "");
    setIsFeatureDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingFeature(null);
    setFeatureTitle("");
    setFeatureDescription("");
    setFeatureLink("");
    setIsFeatureDialogOpen(true);
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || "user";
  };

  const handleToggleOwnerRole = async (userId: string, currentRole: string) => {
    try {
      if (currentRole === "owner") {
        // Remove owner role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "owner");

        if (error) throw error;
        toast.success("Owner role removed");
      } else {
        // Add owner role
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "owner" });

        if (error) throw error;
        toast.success("Owner role granted");
      }
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-4" colorMode="animated-fire" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-r from-navDark to-navBlue">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="hover:bg-white/10 text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Logo className="w-8 h-8" colorMode="animated-fire" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-white">Owner Dashboard</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="border-white/20 text-white hover:text-white hover:bg-white/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="features" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="features" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="dataset" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dataset
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Manage Features</h2>
              <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openAddDialog}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingFeature ? "Edit Feature" : "Add Feature"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={featureTitle}
                        onChange={(e) => setFeatureTitle(e.target.value)}
                        placeholder="Feature title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={featureDescription}
                        onChange={(e) => setFeatureDescription(e.target.value)}
                        placeholder="Feature description"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="link">Link (optional)</Label>
                      <Input
                        id="link"
                        value={featureLink}
                        onChange={(e) => setFeatureLink(e.target.value)}
                        placeholder="https://example.com"
                        type="url"
                      />
                      <p className="text-xs text-muted-foreground">
                        When set, "View Details" will open this link
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSaveFeature}>
                      {editingFeature ? "Update" : "Add"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {features.map((feature) => (
                      <TableRow key={feature.id}>
                        <TableCell className="font-medium">{feature.title}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {feature.description || "-"}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {feature.link ? (
                            <a href={feature.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {feature.link.length > 30 ? feature.link.substring(0, 30) + "..." : feature.link}
                            </a>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                            {feature.status || "upcoming"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(feature)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {features.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No features yet. Add your first feature!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold text-primary">Manage Users</h2>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profiles.map((profile) => {
                      const role = getUserRole(profile.id);
                      const isCurrentUser = profile.id === user?.id;
                      return (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.email}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              role === "owner" 
                                ? "bg-primary text-primary-foreground" 
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {role}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {!isCurrentUser && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleOwnerRole(profile.id, role)}
                              >
                                {role === "owner" ? "Remove Owner" : "Make Owner"}
                              </Button>
                            )}
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground">(You)</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {profiles.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                          No users yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dataset Tab */}
          <TabsContent value="dataset" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Dataset Management</h2>
              {datasetStats && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Total: {datasetStats.total}</span>
                  <span>English: {datasetStats.english}</span>
                  <span>Bengali: {datasetStats.bengali}</span>
                </div>
              )}
            </div>

            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle>Search Dataset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search questions and answers..."
                    value={datasetSearch}
                    onChange={(e) => setDatasetSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDatasetSearch()}
                  />
                  <Button onClick={handleDatasetSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({datasetSearchResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isDatasetLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading dataset...
                  </div>
                ) : !datasetParser ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Failed to load dataset
                  </div>
                ) : datasetSearchResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {datasetSearch ? "No results found" : "Enter a search term above"}
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {datasetSearchResults.map((qa, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            qa.language === 'EN' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {qa.language === 'EN' ? 'English' : 'Bengali'}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">Q:</span>
                          <p className="text-sm text-muted-foreground mt-1">{qa.question}</p>
                        </div>
                        <div>
                          <span className="font-medium text-foreground">A:</span>
                          <p className="text-sm text-muted-foreground mt-1">{qa.answer}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OwnerDashboard;
