import { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIdentityVerification } from '@/hooks/useFirebaseMock';

interface CameraVerificationProps {
  onVerified: () => void;
}

export function CameraVerification({ onVerified }: CameraVerificationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { verifyIdentity, isProcessing } = useIdentityVerification();
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable permissions to proceed.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror the canvas to match the mirrored video
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        // Stop stream after capture
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  }, [stream]);

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleVerify = async () => {
    if (!capturedImage) return;
    const success = await verifyIdentity(capturedImage);
    if (success) {
      setVerificationSuccess(true);
      setTimeout(() => {
        onVerified();
      }, 1500);
    } else {
      setError("Verification failed. Please try again.");
    }
  };

  if (verificationSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-10 h-10 text-success" />
        </div>
        <h3 className="text-xl font-semibold">Identity Verified</h3>
        <p className="text-muted-foreground text-center">Your biometric data matched the registered profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden border-2 border-border">
        {error && !capturedImage ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-destructive bg-destructive/10">
            {error}
          </div>
        ) : capturedImage ? (
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            {stream && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 h-1/2 border-b border-primary/50 scanline" />
                <div className="absolute inset-0 border-[6px] border-primary/20 rounded-lg" />
              </div>
            )}
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-4">
        {!capturedImage ? (
          <Button 
            className="w-full" 
            size="lg" 
            onClick={capturePhoto}
            disabled={!stream}
          >
            <Camera className="w-5 h-5 mr-2" />
            Capture Identity
          </Button>
        ) : (
          <>
            <Button variant="outline" className="flex-1" onClick={retakePhoto} disabled={isProcessing}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake
            </Button>
            <Button className="flex-1" onClick={handleVerify} disabled={isProcessing}>
              {isProcessing ? (
                <span className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Submit Identity
                </span>
              )}
            </Button>
          </>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground text-center">
        * Simulated browser camera API. No data is sent to any external server.
      </p>
    </div>
  );
}