import { Link, useLocation } from "wouter";
import { Shield, LogOut, Settings, LayoutDashboard, LogIn, UserRound } from "lucide-react";
import { useElectionStore } from "@/store/useElectionStore";
import { useFirebaseAuth } from "@/hooks/useFirebaseMock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export function Navbar() {
  const [, setLocation] = useLocation();
  const { signOut } = useFirebaseAuth();
  const session = useElectionStore(state => state.session);
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language?.split("-")[0] || "en";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2 transition-opacity hover:opacity-80">
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">{t("common.appName")}</span>
        </Link>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Select value={currentLanguage} onValueChange={(lang) => i18n.changeLanguage(lang)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder={t("common.language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t("common.languages.en")}</SelectItem>
              <SelectItem value="mr">{t("common.languages.mr")}</SelectItem>
              <SelectItem value="hi">{t("common.languages.hi")}</SelectItem>
            </SelectContent>
          </Select>

          {!session.email ? (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setLocation('/')} className="text-xs">
                <UserRound className="mr-1.5 h-4 w-4" /> {t("navbar.portal")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation('/admin/login')} className="text-xs">
                <LogIn className="mr-1.5 h-4 w-4" /> {t("navbar.adminLogin")}
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
                  <Settings className="w-4 h-4 mr-2" /> {t("common.actions.admin")}
                </Button>
              ) : session.role === 'Candidate' ? (
                <Button variant="outline" size="sm" onClick={() => setLocation('/candidate/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" /> {t("common.actions.candidate")}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setLocation('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" /> {t("common.actions.dashboard")}
                </Button>
              )}

              <Button variant="ghost" size="icon" onClick={() => { signOut(); setLocation('/'); }} title={t("common.actions.logout")}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
