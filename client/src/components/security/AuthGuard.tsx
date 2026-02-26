import { useEffect } from "react";
import { useLocation } from "wouter";
import { useElectionStore } from "@/store/useElectionStore";

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
      return;
    }

    if (requireRole === 'admin' && session.role !== 'admin') {
      setLocation("/dashboard");
      return;
    }

    if (requireRole === 'voter' && session.role === 'admin') {
      setLocation("/admin");
      return;
    }

    if (requireRole === 'voter' && session.role !== 'admin' && !isVerified && location !== '/verification') {
      setLocation('/verification');
      return;
    }

    if (requireRole === 'voter' && session.role !== 'admin' && isVerified && location === '/verification') {
      setLocation('/dashboard');
    }
  }, [session, isVerified, location, requireRole, setLocation]);

  if (!session.email) return null;

  return <>{children}</>;
}
