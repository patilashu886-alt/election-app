import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LogOut,
  Settings,
  LayoutDashboard,
  LogIn,
  UserRound,
  Menu,
  X,
  Globe,
} from "lucide-react";
import { useElectionStore } from "@/store/useElectionStore";
import { useFirebaseAuth } from "@/hooks/useFirebaseMock";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

// Import your logo
import logo from "@/assets/logo.png";

export function Navbar() {
  const [, setLocation] = useLocation();
  const { signOut } = useFirebaseAuth();
  const session = useElectionStore((state) => state.session);
  const { t, i18n } = useTranslation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentLanguage = i18n.language?.split("-")[0] || "en";

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleLogout = () => {
    signOut();
    setLocation("/");
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 md:h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center space-x-2 font-bold transition-opacity hover:opacity-90"
        >
          <img
            src={logo}
            alt={t("common.appName")}
            className="h-9 sm:h-10 md:h-11 w-auto object-contain"
          />
          {/* Optional: show app name beside logo on larger screens */}
          <span className="hidden md:inline-block text-lg font-semibold">
            {t("common.appNameShort", t("common.appName"))}
          </span>
        </Link>

        {/* Desktop / Tablet view */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language selector */}
          <Select value={currentLanguage} onValueChange={(lang) => i18n.changeLanguage(lang)}>
            <SelectTrigger className="h-9 w-[110px] text-sm">
              <Globe className="mr-1.5 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="mr">मराठी</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
            </SelectContent>
          </Select>

          {!session.email ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
                <UserRound className="mr-1.5 h-4 w-4" />
                {t("navbar.portal")}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation("/admin/login")}>
                <LogIn className="mr-1.5 h-4 w-4" />
                {t("navbar.adminLogin")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* User info - hidden on mobile, visible on md+ */}
              <div className="hidden lg:flex flex-col items-end text-xs">
                <span className="font-medium truncate max-w-[180px]">{session.email}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                  {session.role}
                </span>
              </div>

              {/* Role-based actions */}
              {session.role === "admin" ? (
                <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
                  <Settings className="mr-1.5 h-4 w-4" />
                  Admin
                </Button>
              ) : session.role === "Candidate" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/candidate/dashboard")}
                >
                  <LayoutDashboard className="mr-1.5 h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")}>
                    <LayoutDashboard className="mr-1.5 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/profile")}>
                    <UserRound className="mr-1.5 h-4 w-4" />
                    Profile
                  </Button>
                </>
              )}

              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-5 space-y-4 animate-in slide-in-from-top-5 fade-in-20">
          {/* Language on mobile */}
          <div className="pb-2 border-b">
            <Select value={currentLanguage} onValueChange={(lang) => {
              i18n.changeLanguage(lang);
              setMobileMenuOpen(false);
            }}>
              <SelectTrigger className="w-full justify-between">
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Language" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="mr">मराठी</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!session.email ? (
            <div className="grid gap-3">
              <Button variant="outline" onClick={() => { setLocation("/"); setMobileMenuOpen(false); }}>
                <UserRound className="mr-2 h-5 w-5" />
                {t("navbar.portal")}
              </Button>
              <Button
                variant="default"
                onClick={() => { setLocation("/admin/login"); setMobileMenuOpen(false); }}
              >
                <LogIn className="mr-2 h-5 w-5" />
                {t("navbar.adminLogin")}
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {/* Show email/role briefly */}
              <div className="px-3 py-2 bg-muted/40 rounded-md text-sm">
                <div className="font-medium truncate">{session.email}</div>
                <div className="text-xs text-muted-foreground uppercase mt-0.5">
                  {session.role}
                </div>
              </div>

              {session.role === "admin" ? (
                <Button variant="outline" onClick={() => { setLocation("/admin"); setMobileMenuOpen(false); }}>
                  <Settings className="mr-2 h-5 w-5" />
                  Admin Panel
                </Button>
              ) : session.role === "Candidate" ? (
                <Button
                  variant="outline"
                  onClick={() => { setLocation("/candidate/dashboard"); setMobileMenuOpen(false); }}
                >
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Candidate Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => { setLocation("/dashboard"); setMobileMenuOpen(false); }}
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Voter Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setLocation("/profile"); setMobileMenuOpen(false); }}
                  >
                    <UserRound className="mr-2 h-5 w-5" />
                    Profile
                  </Button>
                </>
              )}

              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-5 w-5" />
                Logout
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}