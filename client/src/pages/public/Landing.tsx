import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, ArrowRight, ShieldCheck, FileLock2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useEmailLinkAuth } from "@/hooks/useFirebaseMock";
import { useElectionStore } from "@/store/useElectionStore";

export function Landing() {
  const [location, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const { sendEmailLink, isSending, error } = useEmailLinkAuth();
  const election = useElectionStore(state => state.election);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Auto route to verification step after "sending" link
    const success = await sendEmailLink(email, 'voter');
    if (success) {
      setLocation("/verification");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-background to-muted/20">
      
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-center md:text-left">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <ShieldCheck className="mr-2 h-4 w-4" /> E2E Encrypted Protocol
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            {election.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {election.description} Secure, verifiable, and transparent voting from any device.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
            <div className="flex items-center text-sm text-muted-foreground">
              <FileLock2 className="w-4 h-4 mr-2" />
              Cryptographic Audit
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Zero-Knowledge Proofs
            </div>
          </div>
        </div>

        <Card className="glass shadow-xl border-border/50 animate-in fade-in slide-in-from-right-8 duration-700">
          <CardHeader>
            <CardTitle className="text-2xl">Access Your Ballot</CardTitle>
            <CardDescription>
              Enter your registered email to receive a secure login link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Voter Registration Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="citizen@example.com" 
                    className="pl-10 h-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium" 
                disabled={isSending || !election.isActive}
              >
                {isSending ? "Sending Secure Link..." : (
                  <>
                    Send Login Link <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center border-t border-border/40 pt-4 bg-muted/20">
            {!election.isActive && (
              <p className="text-sm text-destructive font-medium">
                The election is currently inactive.
              </p>
            )}
            <p className="text-xs text-muted-foreground text-center mt-2">
              By continuing, you agree to our terms of service and identity verification requirements.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}