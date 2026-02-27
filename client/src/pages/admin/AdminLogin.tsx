import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ShieldCheck, Lock, Mail, ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserByEmail } from "@/lib/firestore-users";
import { useElectionStore } from "@/store/useElectionStore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useElectionStore((state) => state.login);
  const session = useElectionStore((state) => state.session);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session.email && session.role === "admin") {
      setLocation("/admin");
    }
  }, [session.email, session.role, setLocation]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const existingUser = await getUserByEmail(email);

      if (existingUser?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      login(email, "admin", existingUser.identifier || "ADMIN");
      toast({
        title: "Admin login successful",
        description: "Welcome to the election control center.",
      });
      setLocation("/admin");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Admin login failed",
        description: error?.message || "Invalid admin credentials.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-container max-w-md">
        <Card className="section-card shadow-xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">Admin Sign In</CardTitle>
              <CardDescription>
                Access the secure election administration dashboard.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Admin Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-11 pl-10"
                    placeholder="admin@your-org.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 pl-10"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In to Admin"}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Voter account? <Link href="/" className="font-medium text-primary hover:underline">Go to voter portal</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}