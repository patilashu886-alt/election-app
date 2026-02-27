import { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword, AuthError } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserByEmail } from "@/lib/firestore-users";
import { useElectionStore } from "@/store/useElectionStore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const login = useElectionStore((state) => state.login);
  const session = useElectionStore((state) => state.session);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in as admin
  useEffect(() => {
    if (session?.email && session?.role === "admin") {
      setLocation("/admin");
    }
  }, [session?.email, session?.role, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) return;

    setIsSubmitting(true);

    try {
      // Step 1: Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);

      // Step 2: Check Firestore role
      const userData = await getUserByEmail(trimmedEmail);

      if (!userData || userData.role !== "admin") {
        // Optional: sign out if no admin rights (cleaner UX)
        await auth.signOut();
        throw new Error(t("adminLogin.errors.noAdmin"));
      }

      // Step 3: Update global store
      login(trimmedEmail, "admin", userData.identifier || "ADMIN");

      toast({
        title: t("adminLogin.toasts.successTitle"),
        description: t("adminLogin.toasts.successDesc"),
      });

      setLocation("/admin");
    } catch (err: unknown) {
      const error = err as AuthError;

      let message = t("adminLogin.errors.default");

      if (error.code === "auth/user-not-found") {
        message = t("adminLogin.errors.userNotFound");
      } else if (error.code === "auth/wrong-password") {
        message = t("adminLogin.errors.wrongPassword");
      } else if (error.code === "auth/too-many-requests") {
        message = t("adminLogin.errors.tooManyRequests");
      } else if (error.code === "auth/invalid-email") {
        message = t("adminLogin.errors.invalidEmail");
      } else if (error.message?.includes("admin")) {
        message = error.message; // Keep custom "no admin access" message
      }

      toast({
        variant: "destructive",
        title: t("adminLogin.toasts.failedTitle"),
        description: message,
      });

      // Refocus email field on error (better UX)
      emailInputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell min-h-screen flex items-center justify-center bg-muted/40">
      <div className="page-container w-full max-w-md px-4">
        <Card className="section-card border shadow-2xl">
          <CardHeader className="space-y-6 text-center pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {t("adminLogin.title")}
              </CardTitle>
              <CardDescription className="text-base">
                {t("adminLogin.desc")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  {t("adminLogin.emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10"
                    placeholder={t("adminLogin.emailPlaceholder")}
                    autoComplete="email"
                    autoFocus
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  {t("adminLogin.passwordLabel")}
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full font-medium"
                disabled={isSubmitting || !email.trim() || password.length < 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.status.signingIn")}
                  </>
                ) : (
                  <>
                    {t("adminLogin.signIn")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("adminLogin.areYouVoter")}{" "}
              <Link href="/" className="font-medium text-primary hover:underline">
                {t("adminLogin.goVoterPortal")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}