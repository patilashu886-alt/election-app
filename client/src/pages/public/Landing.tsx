import { useState } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  UserCircle,
  GraduationCap,
  Briefcase,
  Users,
  UserRoundCheck,
  LogIn,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useElectionStore, Role } from "@/store/useElectionStore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createUser, getUserByEmail } from "@/lib/firestore-users";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const login = useElectionStore((state) => state.login);

  // Registration states
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Student");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");

  // Login modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !identifier || !password || !name || !role) return;

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore
      await createUser({
        name,
        email,
        role: role as string,
        identifier,
      });

      toast({
        title: t("landing.toasts.accountCreatedTitle"),
        description: role === "Candidate"
          ? t("landing.toasts.accountCreatedCandidate")
          : t("landing.toasts.accountCreatedVoter"),
      });

      login(email, role, identifier);
      if (role === "Candidate") {
        setLocation("/candidate/dashboard");
      } else {
        setLocation("/verification");
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("landing.toasts.signupErrorTitle"),
        description: err?.message || t("landing.toasts.signupErrorFallback"),
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const existingUser = await getUserByEmail(loginEmail);

      if (!existingUser) {
        throw new Error(t("landing.toasts.noProfile"));
      }

      if (existingUser.role === "admin") {
        login(loginEmail, "admin", existingUser.identifier);
        setLocation("/admin");
      } else if (existingUser.role === "Candidate") {
        login(loginEmail, "Candidate", existingUser.identifier);
        setLocation("/candidate/dashboard");
      } else {
        login(loginEmail, existingUser.role as Role, existingUser.identifier);
        setLocation("/verification");
      }

      toast({
        title: t("landing.toasts.loginSuccessTitle"),
        description: t("landing.toasts.loginSuccessDesc"),
      });

      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: t("landing.toasts.loginFailedTitle"),
        description: err?.message || t("landing.toasts.loginFailedFallback"),
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const idLabel =
    role === "Student" ? t("landing.studentId") : role === "Employee" ? t("landing.employeeId") : role === "Society" ? t("landing.societyId") : t("landing.candidateId");

  return (
    <div className="page-shell">
      <div className="page-container">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20">{t("landing.badge")}</Badge>
          <h1 className="text-5xl font-bold tracking-tight">{t("landing.heroTitle")}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("landing.heroDescription")}
          </p>
          <div className="flex gap-4">
            <div className="flex items-center text-sm font-medium">
              <ShieldCheck className="w-4 h-4 mr-2 text-success" /> {t("landing.featureBiometric")}
            </div>
            <div className="flex items-center text-sm font-medium">
              <ShieldCheck className="w-4 h-4 mr-2 text-success" /> {t("landing.featureMultiAccess")}
            </div>
          </div>
        </div>

        <Card className="section-card border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>{t("landing.registerTitle")}</CardTitle>
            <CardDescription>
              {t("landing.registerDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* ... your existing registration form fields remain unchanged ... */}

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("landing.selectRole")}</label>
                <Tabs
                  value={role || ""}
                  onValueChange={(v) => setRole(v as Role)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="Student">
                      <GraduationCap className="w-4 h-4 mr-1 hidden sm:block" /> {t("landing.roles.student")}
                    </TabsTrigger>
                    <TabsTrigger value="Employee">
                      <Briefcase className="w-4 h-4 mr-1 hidden sm:block" /> {t("landing.roles.staff")}
                    </TabsTrigger>
                    <TabsTrigger value="Society">
                      <Users className="w-4 h-4 mr-1 hidden sm:block" /> {t("landing.roles.society")}
                    </TabsTrigger>
                    <TabsTrigger value="Candidate">
                      <UserRoundCheck className="w-4 h-4 mr-1 hidden sm:block" /> {t("landing.roles.candidate")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("landing.email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder={t("landing.placeholders.email")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("landing.password")}</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder={t("landing.placeholders.password")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t("landing.fullName")}</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder={t("landing.placeholders.fullName")}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{idLabel}</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="pl-10"
                    placeholder={t("landing.placeholders.enter", { label: idLabel })}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={!email || !identifier || !password || !name}
              >
                {role === "Candidate" ? t("landing.registerContinue") : t("landing.registerVerify")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* New: Login link */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                {t("landing.alreadyAccount")}{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-primary"
                  onClick={() => setShowLoginModal(true)}
                >
                  {t("landing.login")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* ── Login Modal ──────────────────────────────────────────────── */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="relative">
            <DialogTitle>{t("landing.loginModalTitle")}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-2 top-2">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("landing.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-10"
                  placeholder={t("landing.placeholders.email")}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("landing.password")}</label>
              <div className="relative">
                <LogIn className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? t("common.status.loggingIn") : t("landing.loginButton")}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              {t("landing.dontHaveAccount")}{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => setShowLoginModal(false)}
              >
                {t("landing.signup")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}
    >
      {children}
    </span>
  );
}