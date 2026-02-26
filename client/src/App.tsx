import { Switch, Route } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Navbar } from "@/components/layout/Navbar";
import { AuthGuard } from "@/components/security/AuthGuard";

import { Landing } from "@/pages/public/Landing";
import { Verification } from "@/pages/public/Verification";
import { Voting } from "@/pages/public/Voting";
import { AdminDashboard } from "@/pages/admin/Dashboard";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 relative z-0">
        <Switch>
          <Route path="/" component={Landing} />
          
          <Route path="/verification">
            <AuthGuard requireRole="voter">
              <Verification />
            </AuthGuard>
          </Route>
          
          <Route path="/voting">
            <AuthGuard requireRole="voter" requireActiveElection={true}>
              <Voting />
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
