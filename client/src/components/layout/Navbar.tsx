import { Link, useLocation } from "wouter";
import { Shield, ShieldAlert, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useElectionStore } from "@/store/useElectionStore";
import { useFirebaseAuth } from "@/hooks/useFirebaseMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useFirebaseAuth();
  const session = useElectionStore(state => state.session);
  const login = useElectionStore(state => state.login);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <Link href="/" className="flex items-center space-x-2 mr-6 hover:opacity-80 transition-opacity">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold tracking-tight text-lg">SecureVote v2</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {!session.email ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => login('admin@gov.org', 'admin')} className="text-xs">
                Admin Panel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-medium">{session.email}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{session.role}</span>
              </div>
              
              {session.role === 'admin' ? (
                <Button variant="outline" size="sm" onClick={() => setLocation('/admin')}>
                  <Settings className="w-4 h-4 mr-2" /> Admin
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setLocation('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={() => { signOut(); setLocation('/'); }} title="Sign Out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
