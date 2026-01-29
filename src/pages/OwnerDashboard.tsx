import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Users, LayoutGrid, LogOut, Shield, Database as DatabaseIcon, Search } from "lucide-react";
import { toast } from "sonner";
import Logo from "@/components/Logo";
import { DatasetParser, QAData } from "@/utils/datasetParser";
import { getAvailableFeaturesColumns } from "@/utils/featuresSchemaUtils";

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
  const [featureStatus, setFeatureStatus] = useState<"active" | "upcoming">("upcoming");
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
  const [availableColumns, setAvailableColumns] = useState<string[]>(['id', 'title', 'description', 'status', 'sort_order', 'created_at']);

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

  // Use the same supabase client to maintain session consistency
  const ownerSupabase = supabase;

  // Debug Supabase configuration
  useEffect(() => {
    console.log("=== SUPABASE CONFIG DEBUG ===");
    console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
    console.log("VITE_SUPABASE_PUBLISHABLE_KEY:", import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20) + "...");
    // console.log("Default Supabase client URL:", supabase.supabaseUrl);
    // console.log("Owner Supabase client URL:", ownerSupabase.supabaseUrl);

    // Test connection with owner client
    ownerSupabase.from('features').select('*').limit(1).then(result => {
      console.log("Owner client test result:", result);
    }, error => {
      console.error("Owner client test error:", error);
    });

    console.log("=== END SUPABASE CONFIG DEBUG ===");
  }, []);

  // Test database connection
  const testDatabaseConnection = async () => {
    console.log("=== TESTING DATABASE CONNECTION ===");
    // console.log("Using ownerSupabase client with URL:", ownerSupabase.supabaseUrl);

    try {
      // Test 1: Check if we can query the features table and get actual schema
      console.log("Test 1: Querying features table...");
      const { data: featuresData, error: featuresError } = await ownerSupabase
        .from("features")
        .select("*")
        .limit(1);

      console.log("Features query result:", {
        data: featuresData,
        error: featuresError,
        dataLength: featuresData?.length
      });

      // Test 1b: Check table schema
      console.log("Test 1b: Checking table schema...");
      const { data: schemaData, error: schemaError } = await ownerSupabase
        .from("features")
        .select("id, title, description, status, sort_order, created_at")
        .limit(0);

      console.log("Schema check result:", {
        error: schemaError,
        columns: schemaError ? 'unknown' : ['id', 'title', 'description', 'status', 'sort_order', 'created_at']
      });

      // Test 2: Check user session
      console.log("Test 2: Checking user session...");
      const { data: sessionData, error: sessionError } = await ownerSupabase.auth.getSession();
      console.log("Session result:", {
        session: sessionData,
        error: sessionError,
        hasSession: !!sessionData.session,
        user: sessionData.session?.user
      });

      // Test 3: Check RLS policies by trying a simple insert with only basic fields
      console.log("Test 3: Testing insert permission with minimal data...");
      const testData = {
        title: "TEST_FEATURE_" + Date.now(),
        description: "Test description",
        status: 'active',
        sort_order: 999
      };

      const { data: insertData, error: insertError } = await ownerSupabase
        .from("features")
        .insert(testData)
        .select()
        .single();

      console.log("Insert test result:", {
        data: insertData,
        error: insertError,
        success: !insertError
      });

      // If insert succeeded, delete the test data
      if (insertData?.id) {
        console.log("Test 4: Cleaning up test data...");
        const { error: deleteError } = await ownerSupabase
          .from("features")
          .delete()
          .eq("id", insertData.id);
        console.log("Cleanup result:", { error: deleteError, success: !deleteError });
      }

    } catch (error) {
      console.error("Database connection test failed:", error);
    }
    console.log("=== DATABASE CONNECTION TEST COMPLETE ===");
  };

  const fetchData = async () => {
    setIsLoadingData(true);
    try {
      // Build select query with all available columns including link
      let selectQuery = "id, title, description, status, sort_order, link, created_at";

      const { data: featuresData, error: featuresError } = await ownerSupabase
        .from("features")
        .select(selectQuery)
        .order("sort_order", { ascending: true });

      if (featuresError) {
        console.error("Error fetching features:", featuresError);
        toast.error("Failed to load features");
      } else {
        setFeatures((featuresData as unknown as Feature[]) || []);

        // Detect available columns from the first feature
        if (featuresData && featuresData.length > 0) {
          const firstFeature = featuresData[0];
          const columns = Object.keys(firstFeature).filter(key =>
            key !== 'id' && key !== 'created_at' && key !== 'updated_at'
          );
          setAvailableColumns(columns);
          console.log("Available columns detected:", columns);
          console.log("First feature data:", firstFeature);
          console.log("Link column available:", columns.includes('link'));
        } else {
          console.log("No features found, using default columns");
          setAvailableColumns(['title', 'description', 'status', 'sort_order']);
        }
      }

      // Fetch profiles (all users)
      const { data: profilesData, error: profilesError } = await ownerSupabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await ownerSupabase
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

    console.log("=== SAVE FEATURE STARTING ===");
    console.log("Title:", featureTitle);
    console.log("Status:", featureStatus);
    console.log("Link:", featureLink);

    try {
      const saveData: any = {
        title: featureTitle,
        description: featureDescription || null,
        status: featureStatus,
        link: featureLink?.trim() || null,
      };

      if (!editingFeature) {
        const maxOrder = features.length > 0 ? Math.max(...features.map(f => f.sort_order || 0)) : 0;
        saveData.sort_order = maxOrder + 1;
      }

      console.log("Prepared save data:", saveData);

      if (editingFeature) {
        console.log(`Updating feature ID: ${editingFeature.id}...`);
        const { error } = await ownerSupabase
          .from("features")
          .update(saveData)
          .eq("id", editingFeature.id);

        if (error) throw error;
        toast.success("Feature updated successfully!");
      } else {
        console.log("Inserting new feature...");
        const { error } = await ownerSupabase
          .from("features")
          .insert(saveData);

        if (error) throw error;
        toast.success("New feature added successfully!");
      }

      setFeatureTitle("");
      setFeatureDescription("");
      setFeatureLink("");
      setFeatureStatus("upcoming");
      setEditingFeature(null);
      setIsFeatureDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Feature save failed:", error);
      const errorMessage = error.message || "Unknown error occurred";

      if (error.code === '42501') {
        toast.error("Permission denied. Ensure you are logged in as owner.");
      } else if (error.code === 'PGRST102') {
        toast.error("Database error. Please check if the 'features' table exists.");
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      console.log("=== SAVE FEATURE COMPLETED ===");
    }
  };

  const handleDeleteFeature = async (id: string) => {
    console.log("=== DELETE FEATURE DEBUG - START ===");
    console.log("Delete button clicked for feature ID:", id);

    if (!confirm("Are you sure you want to delete this feature?")) {
      console.log("User cancelled deletion");
      return;
    }

    console.log("=== DELETE FEATURE DEBUG ===");
    console.log("Attempting to delete feature with ID:", id);
    console.log("User:", user);
    console.log("Is Owner:", isOwner);

    try {
      const { error, data } = await ownerSupabase.from("features").delete().eq("id", id);
      console.log("Delete result:", { error, data });

      if (error) {
        console.error("Delete error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      toast.success("Feature deleted!");
      fetchData();
    } catch (error: unknown) {
      console.error("Delete feature error:", error);
      if (error instanceof Error) {
        if ('code' in error && error.code === '42501') {
          toast.error("Permission denied. Please ensure you have owner privileges.");
        } else if ('code' in error && error.code === 'PGRST204') {
          toast.error("Database schema issue. Please contact support.");
        } else if (error.message?.includes('row-level security')) {
          toast.error("Access denied. Please log in as an owner.");
        } else {
          toast.error(error.message || "Failed to delete feature");
        }
      } else {
        toast.error("Failed to delete feature");
      }
    }
  };

  const openEditDialog = (feature: Feature) => {
    setEditingFeature(feature);
    setFeatureTitle(feature.title);
    setFeatureDescription(feature.description || "");
    setFeatureStatus((feature.status as "active" | "upcoming") || "upcoming");
    setFeatureLink(feature.link || "");
    setIsFeatureDialogOpen(true);
  };

  const openAddDialog = () => {
    console.log("=== OPEN ADD DIALOG ===");
    setEditingFeature(null);
    setFeatureTitle("");
    setFeatureDescription("");
    setFeatureStatus("upcoming");
    setFeatureLink("");
    setIsFeatureDialogOpen(true);
    console.log("Dialog should be open now");
  };

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || "user";
  };

  const handleToggleOwnerRole = async (userId: string, currentRole: string) => {
    try {
      if (currentRole === "owner") {
        // Remove owner role
        const { error } = await ownerSupabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "owner");

        if (error) throw error;
        toast.success("Owner role removed");
      } else {
        // Add owner role
        const { error } = await ownerSupabase
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
    try {
      const { error } = await ownerSupabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('SignOut error:', error);
      }
    } catch (error) {
      console.error('SignOut error:', error);
    } finally {
      // Always navigate regardless of signOut result
      navigate("/");
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Logo className="w-16 h-16 mx-auto mb-4" />
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
              <Logo className="w-8 h-8" />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-white">Owner Dashboard</span>
              </div>
              <div className="text-xs text-white/70">
                Debug: User: {user ? '✓' : '✗'} | Owner: {isOwner ? '✓' : '✗'} | Loading: {loading ? '✓' : '✗'}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testDatabaseConnection}
                className="border-white/20 text-white hover:text-white hover:bg-white/10"
              >
                Test DB
              </Button>
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
              <DatabaseIcon className="w-4 h-4" />
              Dataset
            </TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-primary">Manage Features</h2>
              <Button onClick={openAddDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>

            {/* Feature Dialog - Separate from trigger buttons */}
            <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
              <DialogContent className="max-w-lg">
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
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="upcoming"
                          value="upcoming"
                          checked={featureStatus === "upcoming"}
                          onChange={(e) => setFeatureStatus(e.target.value as "active" | "upcoming")}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="upcoming">Upcoming</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="active"
                          value="active"
                          checked={featureStatus === "active"}
                          onChange={(e) => setFeatureStatus(e.target.value as "active" | "upcoming")}
                          className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="active">Active</Label>
                      </div>
                    </div>
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
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${role === "owner"
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
                          <span className={`px-2 py-1 rounded text-xs font-medium ${qa.language === 'EN'
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
