import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useElectionStore } from "@/store/useElectionStore";
import { CameraVerification } from "@/components/security/CameraVerification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MailCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendEmailVerification, isEmailVerified } from "@/lib/firebase-auth-helpers";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export function Verification() {
  const [, setLocation] = useLocation();
  const step = useElectionStore(state => state.verificationStep);
  const setVerificationStep = useElectionStore(state => state.setVerificationStep);
  const userEmail = useElectionStore(state => state.session.email);
  const { toast } = useToast();
  const { t } = useTranslation();

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Send email verification when user first arrives at email step
  useEffect(() => {
    if (!userEmail) {
      setLocation("/");
      return;
    }

    if (step === 'email_sent' && !emailSent && !isSendingEmail) {
      sendVerificationEmail();
    }
  }, [step, userEmail, emailSent, isSendingEmail]);

  // Check if user has verified their email (poll every 3 seconds)
  useEffect(() => {
    if (step !== 'email_sent') return;

    let checkInterval: NodeJS.Timeout;
    
    const checkVerification = async () => {
      try {
        const verified = await isEmailVerified();
        if (verified) {
          setVerificationStep('email_verified');
          setVerificationStep('camera_pending');
          toast({ title: t("verification.toasts.emailVerifiedTitle"), description: t("verification.toasts.emailVerifiedDesc") });
        }
      } catch (err) {
        console.error('Error checking email verification:', err);
      }
    };

    checkInterval = setInterval(checkVerification, 3000);

    return () => clearInterval(checkInterval);
  }, [step, setVerificationStep, toast]);

  const sendVerificationEmail = async () => {
    setIsSendingEmail(true);
    setLastError(null);
    try {
      await sendEmailVerification();
      setEmailSent(true);
      toast({ 
        title: t("verification.toasts.emailSentTitle"), 
        description: t("verification.toasts.emailSentDesc", { email: userEmail })
      });
    } catch (err: any) {
      const message = err?.message || t("verification.toasts.errorFallback");
      setLastError(message);
      toast({ title: t("verification.toasts.errorTitle"), description: message });
      console.error('Email verification error:', err);
    } finally {
      setIsSendingEmail(false);
    }
  };

  // If they already verified, skip this page
  useEffect(() => {
    if (step === 'camera_verified') {
      setLocation("/dashboard");
    }
  }, [step, setLocation]);

  const handleCameraVerified = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="page-shell animate-in fade-in duration-500">
      <div className="page-container max-w-2xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("verification.title")}</h1>
        <p className="text-muted-foreground">
          {t("verification.description")}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Step 1: Email */}
        <Card className={`section-card transition-all duration-300 ${step === 'email_sent' ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'opacity-70'}`}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              step === 'email_sent' ? 'bg-primary text-primary-foreground' : 'bg-success text-success-foreground'
            }`}>
              {step === 'email_sent' ? '1' : <CheckCircle2 className="w-6 h-6" />}
            </div>
            <div>
              <CardTitle>{t("verification.emailTitle")}</CardTitle>
              <CardDescription>{t("verification.emailDesc")}</CardDescription>
            </div>
          </CardHeader>
          {step === 'email_sent' && (
            <CardContent className="space-y-4 pt-4 border-t mt-4 border-border/40">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <MailCheck className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  {t("verification.emailSentMessage", { email: userEmail })}
                </div>
              </div>

              {lastError && (
                <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  <div className="text-sm text-destructive">{lastError}</div>
                </div>
              )}
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("verification.waiting")}
              </div>

              <div className="text-xs text-muted-foreground space-y-1 p-2 bg-muted/30 rounded">
                <p><strong>{t("verification.tipsTitle")}</strong></p>
                <p>{t("verification.tips.spam")}</p>
                <p>{t("verification.tips.delay")}</p>
                <p>{t("verification.tips.resend")}</p>
              </div>

              <Button 
                onClick={sendVerificationEmail} 
                variant="outline" 
                className="w-full"
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("common.status.sending")}
                  </>
                ) : (
                  t("verification.resend")
                )}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Step 2: Camera */}
        <Card className={`section-card transition-all duration-300 ${step === 'camera_pending' ? 'border-primary shadow-lg ring-1 ring-primary/20' : step === 'email_sent' ? 'opacity-50' : ''}`}>
          <CardHeader className="flex flex-row items-center gap-4 pb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
              step === 'camera_pending' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              2
            </div>
            <div>
              <CardTitle>{t("verification.biometricTitle")}</CardTitle>
              <CardDescription>{t("verification.biometricDesc")}</CardDescription>
            </div>
          </CardHeader>
          {step === 'camera_pending' && (
             <CardContent className="pt-4 border-t mt-4 border-border/40">
               <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg mb-6 flex gap-3 text-sm text-warning-foreground">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 <p>{t("verification.biometricPrivacy")}</p>
               </div>
               <CameraVerification onVerified={handleCameraVerified} />
             </CardContent>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}