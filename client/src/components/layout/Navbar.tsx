import { Link, useLocation } from "wouter";
import { Shield, ShieldAlert, LogOut, Settings } from "lucide-react";
import { useElectionStore } from "@/store/useElectionStore";
import { useFirebaseAuth } from "@/hooks/useFirebaseMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useFirebaseAuth();
  const election = useElectionStore(state => state.election);
  
  // For dev/mocking purposes: toggle roles quickly
  const login = useElectionStore(state => state.login);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-6 hover:opacity-80 transition-opacity">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight text-lg hidden sm:inline-block">
            SecureVote
          </span>
        </Link>
        
        <div className="flex items-center space-x-4">
          {election.isActive ? (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <span className="status-dot active mr-2" /> Live
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-muted text-muted-foreground border-muted">
              <span className="status-dot inactive mr-2" /> Ended
            </Badge>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          {!user ? (
            <div className="flex gap-2">
               {/* Dev Mode Toggles */}
              <Button variant="ghost" size="sm" onClick={() => login('voter@example.com', 'voter')} className="text-xs">
                Mock Voter Login
              </Button>
              <Button variant="ghost" size="sm" onClick={() => login('admin@gov.org', 'admin')} className="text-xs">
                Mock Admin Login
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-medium">{user.email}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
              
              {user.role === 'admin' && location !== '/admin' && (
                <Button variant="outline" size="sm" onClick={() => setLocation('/admin')}>
                  <Settings className="w-4 h-4 mr-2" /> Admin
                </Button>
              )}
              {user.role === 'voter' && location !== '/voting' && (
                <Button variant="outline" size="sm" onClick={() => setLocation('/voting')}>
                  Vote Now
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={signOut} title="Sign Out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}