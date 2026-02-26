import { useEffect } from "react";
import { useLocation } from "wouter";
import { useElectionStore, Role } from "@/store/useElectionStore";
import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'voter' | 'admin';
  requireActiveElection?: boolean;
}

export function AuthGuard({ children, requireRole, requireActiveElection = false }: AuthGuardProps) {
  const [location, setLocation] = useLocation();
  const session = useElectionStore(state => state.session);
  const isVerified = useElectionStore(state => state.isVerified);
  
  useEffect(() => {
    if (!session.email) {
      setLocation("/");
    } else if (requireRole === 'admin' && session.role !== 'admin') {
      setLocation("/dashboard");
    } else if (requireRole === 'voter' && session.role === 'admin') {
      setLocation("/admin");
    }
  }, [session, requireRole, setLocation]);

  if (!session.email) return null;

  // If voter needs to be verified
  if (session.role !== 'admin' && !isVerified && location !== '/verification') {
     setLocation('/verification');
     return null;
  }

  return <>{children}</>;
}
