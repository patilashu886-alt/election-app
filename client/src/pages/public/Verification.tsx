import { useEffect } from "react";
import { useLocation } from "wouter";
import { useElectionStore } from "@/store/useElectionStore";
import { CameraVerification } from "@/components/security/CameraVerification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Verification() {
  const [, setLocation] = useLocation();
  const step = useElectionStore(state => state.verificationStep);
  const setVerificationStep = useElectionStore(state => state.setVerificationStep);
  const userEmail = useElectionStore(state => state.session.email);

  useEffect(() => {
    if (!userEmail) {
      setLocation("/");
    }
    // If they already verified, skip this page
    if (step === 'camera_verified') {
      setLocation("/dashboard");
    }
  }, [userEmail, step, setLocation]);

  const handleEmailVerifiedMock = () => {
    setVerificationStep('email_verified');
    setVerificationStep('camera_pending');
  };

  const handleCameraVerified = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="container max-w-2xl py-12 animate-in fade-in duration-500">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Identity Verification</h1>
        <p className="text-muted-foreground">
          To ensure one person one vote, we require standard identity checks.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Email */}
        <Card className={`glass transition-all duration-300 ${step === 'email_sent' ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'opacity-70'}`}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              step === 'email_sent' ? 'bg-primary text-primary-foreground' : 'bg-success text-success-foreground'
            }`}>
              {step === 'email_sent' ? '1' : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <CardTitle>Email Confirmation</CardTitle>
              <CardDescription>Verify your registration email</CardDescription>
            </div>
          </CardHeader>
          {step === 'email_sent' && (
            <CardContent className="space-y-4 pt-4 border-t mt-4 border-border/40">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <MailCheck className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  We've sent a magic link to <span className="font-semibold">{userEmail}</span>. 
                  (Click below to simulate clicking the link in your email).
                </div>
              </div>
              <Button onClick={handleEmailVerifiedMock} className="w-full">
                [Mock] Click Email Link
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Step 2: Camera */}
        <Card className={`glass transition-all duration-300 ${step === 'camera_pending' ? 'border-primary shadow-lg ring-1 ring-primary/20' : step === 'email_sent' ? 'opacity-50' : ''}`}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              step === 'camera_pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div>
              <CardTitle>Biometric Verification</CardTitle>
              <CardDescription>Liveness check using your device camera</CardDescription>
            </div>
          </CardHeader>
          {step === 'camera_pending' && (
             <CardContent className="pt-4 border-t mt-4 border-border/40">
               <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg mb-6 flex gap-3 text-sm text-warning-foreground">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 <p>Your biometric data is processed entirely in your browser and is never stored on our servers. This ensures privacy while preventing duplicate votes.</p>
               </div>
               <CameraVerification onVerified={handleCameraVerified} />
             </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}