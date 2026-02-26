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
import { createUser } from "@/lib/firestore-users";
import { useToast } from "@/hooks/use-toast";

export function Landing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
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
        title: "Account created",
        description: "Account created successfully. Proceed to verification.",
      });

      login(email, role, identifier);
      setLocation("/verification");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Signup error",
        description: err?.message || "Failed to create account",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setIsLoggingIn(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);

      // Here you should ideally fetch user data from Firestore
      // For simplicity — assuming role & identifier are stored, but for now we can skip or mock
      // In real app → fetch user doc and call login(email, role, identifier)

      // Temporary: assume role from email or something (improve later)
      // Better: fetch from Firestore users collection
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });

      // For now — just mark as logged in (you'll improve this)
      login(loginEmail, "Student", undefined); // ← replace with real role fetch
      setLocation("/verification"); // or "/dashboard" depending on role

      setShowLoginModal(false);
      setLoginEmail("");
      setLoginPassword("");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err?.message || "Invalid email or password",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const idLabel =
    role === "Student" ? "Student ID" : role === "Employee" ? "Employee ID" : "Society ID";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <Badge className="bg-primary/10 text-primary border-primary/20">v2.0 Advanced Protocol</Badge>
          <h1 className="text-5xl font-bold tracking-tight">Secure & Verifiable Multi-Election System</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The next generation of democratic participation. Unified voting for colleges, companies,
            and societies with role-based identity management.
          </p>
          <div className="flex gap-4">
            <div className="flex items-center text-sm font-medium">
              <ShieldCheck className="w-4 h-4 mr-2 text-success" /> Biometric Identity
            </div>
            <div className="flex items-center text-sm font-medium">
              <ShieldCheck className="w-4 h-4 mr-2 text-success" /> Multi-Election Access
            </div>
          </div>
        </div>

        <Card className="glass border-border/50 shadow-2xl">
          <CardHeader>
            <CardTitle>Voter Registration</CardTitle>
            <CardDescription>
              Select your role and enter your details to access active elections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* ... your existing registration form fields remain unchanged ... */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Your Role</label>
                <Tabs
                  value={role || ""}
                  onValueChange={(v) => setRole(v as Role)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="Student">
                      <GraduationCap className="w-4 h-4 mr-1 hidden sm:block" /> Student
                    </TabsTrigger>
                    <TabsTrigger value="Employee">
                      <Briefcase className="w-4 h-4 mr-1 hidden sm:block" /> Staff
                    </TabsTrigger>
                    <TabsTrigger value="Society">
                      <Users className="w-4 h-4 mr-1 hidden sm:block" /> Society
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Your full name"
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
                    placeholder={`Enter ${idLabel}`}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={!email || !identifier || !password || !name}
              >
                Register & Verify <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* New: Login link */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium text-primary"
                  onClick={() => setShowLoginModal(true)}
                >
                  Log in
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* ── Login Modal ──────────────────────────────────────────────── */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="relative">
            <DialogTitle>Log In to Your Account</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-2 top-2">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="pl-10"
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
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
              {isLoggingIn ? "Logging in..." : "Log In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => setShowLoginModal(false)}
              >
                Sign up
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