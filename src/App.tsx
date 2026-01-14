import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import UpcomingFeature from "./pages/UpcomingFeature";
import Profile from "./pages/Profile";
import OwnerAuth from "./pages/OwnerAuth";
// Frontend deployment complete
import OwnerDashboard from "./pages/OwnerDashboard";
import NotFound from "./pages/NotFound";
import FloatingParticles from "./components/FloatingParticles";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FloatingParticles />
      <Toaster />
      <Sonner />
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upcoming/:id" element={<UpcomingFeature />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/owner/login" element={<OwnerAuth />} />
          <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
