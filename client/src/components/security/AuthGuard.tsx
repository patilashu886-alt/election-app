import { useEffect } from "react";
import { useLocation } from "wouter";
import { useElectionStore } from "@/store/useElectionStore";

interface AuthGuardProps {
  children: React.ReactNode;
  requireRole?: 'voter' | 'admin' | 'candidate';
  requireActiveElection?: boolean;
}

export function AuthGuard({ children, requireRole, requireActiveElection = false }: AuthGuardProps) {
  const [location, setLocation] = useLocation();
  const session = useElectionStore(state => state.session);
  const isVerified = useElectionStore(state => state.isVerified);
  
  useEffect(() => {
    if (!session.email) {
      if (requireRole === 'admin') {
        setLocation('/admin/login');
      } else {
        setLocation('/');
      }
      return;
    }

    if (requireRole === 'admin' && session.role !== 'admin') {
      setLocation(session.role === 'Candidate' ? '/candidate/dashboard' : '/dashboard');
      return;
    }

    if (requireRole === 'candidate' && session.role !== 'Candidate') {
      if (session.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
      return;
    }

    if (requireRole === 'voter' && (session.role === 'admin' || session.role === 'Candidate')) {
      if (session.role === 'admin') {
        setLocation('/admin');
      } else {
        setLocation('/candidate/dashboard');
      }
      return;
    }

    if (requireRole === 'candidate' && location === '/verification') {
      setLocation('/candidate/dashboard');
      return;
    }

    if (requireRole === 'voter' && session.role !== 'admin' && session.role !== 'Candidate' && !isVerified && location !== '/verification') {
      setLocation('/verification');
      return;
    }

    if (requireRole === 'voter' && session.role !== 'admin' && session.role !== 'Candidate' && isVerified && location === '/verification') {
      setLocation('/dashboard');
    }
  }, [session, isVerified, location, requireRole, setLocation]);

  if (!session.email) return null;

  return <>{children}</>;
}
