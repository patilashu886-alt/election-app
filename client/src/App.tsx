import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/security/AuthGuard";

import { Landing } from "@/pages/public/Landing";
import { Verification } from "@/pages/public/Verification";
import { VoterDashboard } from "@/pages/public/VoterDashboard";
import { CategorySelection } from "@/pages/public/CategorySelection";
import { CandidateDetail } from "@/pages/public/CandidateDetail";
import { CandidateDashboard } from "@/pages/public/CandidateDashboard";
import { AdminDashboard } from "@/pages/admin/Dashboard";
import { AdminLogin } from "@/pages/admin/AdminLogin";
import { Privacy } from "@/pages/Privacy/Privacy";

import { Profile } from "@/pages/public/Profile";
import { useElectionStore } from "@/store/useElectionStore";

function Router() {
  const initializeElections = useElectionStore((state) => state.initializeElections);
  const cleanupElections = useElectionStore((state) => state.cleanupElections);

  useEffect(() => {
    initializeElections();
    return () => cleanupElections();
  }, [initializeElections, cleanupElections]);

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 relative z-0">
        <Switch>
          <Route path="/" component={Landing} />
          
          {/* Added public privacy page – no AuthGuard needed */}
          <Route path="/privacy" component={Privacy} />
          
          <Route path="/admin/login" component={AdminLogin} />
          
          <Route path="/verification">
            <AuthGuard requireRole="voter">
              <Verification />
            </AuthGuard>
          </Route>
          
          <Route path="/dashboard">
            <AuthGuard requireRole="voter">
              <VoterDashboard />
            </AuthGuard>
          </Route>

          {/* profile page allows a logged-in user to see their full record */}
          <Route path="/profile">
            <AuthGuard requireRole="voter">
              <Profile />
            </AuthGuard>
          </Route>

          <Route path="/candidate/dashboard">
            <AuthGuard requireRole="candidate">
              <CandidateDashboard />
            </AuthGuard>
          </Route>

          <Route path="/election/:id">
            <AuthGuard requireRole="voter">
              <CategorySelection />
            </AuthGuard>
          </Route>

          <Route path="/election/:eid/category/:cid">
            <AuthGuard requireRole="voter">
              <CandidateDetail />
            </AuthGuard>
          </Route>
          
          <Route path="/admin">
            <AuthGuard requireRole="admin">
              <AdminDashboard />
            </AuthGuard>
          </Route>
          
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;