import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScanSuccess: (seatNumber: string) => void;
}

export const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const verifyTimeoutRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const isScanningRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (verifyTimeoutRef.current !== null) {
      window.clearTimeout(verifyTimeoutRef.current);
      verifyTimeoutRef.current = null;
    }

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    isScanningRef.current = false;
    setIsScanning(false);
    setIsPreparing(false);
    setIsCameraReady(false);
  }, []);

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isScanningRef.current) {
      return;
    }

    if (video.readyState < video.HAVE_CURRENT_DATA) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    if (canvas.width !== video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });

    if (qrCode?.data) {
      toast.success('QR Code scanned successfully!');
      onScanSuccess(qrCode.data);
      stopCamera();
      return;
    }

    animationRef.current = requestAnimationFrame(scanFrame);
  }, [onScanSuccess, stopCamera]);

  const startCamera = useCallback(async () => {
    if (isPreparing || isScanningRef.current) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access is not supported in this browser.');
      return;
    }

    setError(null);
    setIsPreparing(true);

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (primaryError) {
        console.warn('Back camera unavailable, falling back to default camera.', primaryError);
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element not found');
      }

      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;

      await video.play();

      if (!isMountedRef.current) {
        stopCamera();
        return;
      }

      isScanningRef.current = true;
      setIsScanning(true);
      setIsCameraReady(true);

      animationRef.current = requestAnimationFrame(scanFrame);

      verifyTimeoutRef.current = window.setTimeout(() => {
        const currentVideo = videoRef.current;
        if (!currentVideo) {
          return;
        }

        const activeStream = currentVideo.srcObject as MediaStream | null;
        const hasLiveTrack = !!activeStream && activeStream.getVideoTracks().some((track) => track.readyState === 'live');

        if (!hasLiveTrack) {
          console.error('Camera stream is not active.');
          setError('Camera preview failed to load. Please retry.');
          stopCamera();
          return;
        }

        setIsPreparing(false);
      }, 1000);
    } catch (err) {
      console.error('Camera error:', err);
      setError(err instanceof Error ? err.message : 'Camera access denied');
      stopCamera();
    }
  }, [isPreparing, scanFrame, stopCamera]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-accent" />
          Scan Your Bus Seat QR Code
        </CardTitle>
        <CardDescription>Point your camera at the QR code on your college bus seat</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative w-full max-w-lg mx-auto rounded-lg bg-black overflow-hidden min-h-[400px]">
          <video
            ref={videoRef}
            className={`w-full ${isCameraReady ? 'block' : 'hidden'}`}
            playsInline
            muted
            autoPlay
          />
          <canvas ref={canvasRef} className="hidden" />

          {!isCameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted">
              <Skeleton className="h-16 w-16 rounded-full" />
              <p className="text-sm text-muted-foreground">
                {isPreparing ? 'Opening camera…' : 'Camera preview will appear here'}
              </p>
            </div>
          )}

          {isScanning && isCameraReady && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-green-500 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 border-4 border-white rounded-lg" />
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Camera issue detected</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startCamera} disabled={isPreparing} className="w-full bg-accent hover:bg-accent/90">
              <Camera className="mr-2 h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button onClick={stopCamera} variant="destructive" className="w-full">
              <XCircle className="mr-2 h-4 w-4" />
              Stop Camera
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
