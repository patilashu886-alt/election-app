import { useEffect } from "react";
import { useLocation } from "wouter";
import { useElectionStore, Role } from "@/store/useElectionStore";
import { ShieldAlert, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: Role;
  requireActiveElection?: boolean;
}

export function AuthGuard({ children, requireRole, requireActiveElection = false }: AuthGuardProps) {
  const [location, setLocation] = useLocation();
  const userRole = useElectionStore(state => state.userRole);
  const election = useElectionStore(state => state.election);
  const isVerified = useElectionStore(state => state.isVerified);
  
  useEffect(() => {
    if (!userRole) {
      // Not logged in
      setLocation("/");
    } else if (requireRole && userRole !== requireRole) {
      // Wrong role
      setLocation("/");
    }
  }, [userRole, requireRole, setLocation]);

  if (!userRole) return null; // Let the useEffect redirect

  if (requireActiveElection && !election.isActive) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/20 glass">
          <CardHeader className="text-center">
            <div className="mx-auto bg-destructive/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Election Inactive</CardTitle>
            <CardDescription>
              The election is currently closed or has ended. You cannot cast a vote at this time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => setLocation("/")}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If voter needs to be verified before seeing the actual protected voting screen
  if (requireRole === 'voter' && !isVerified && location !== '/verification') {
     setLocation('/verification');
     return null;
  }

  return <>{children}</>;
}