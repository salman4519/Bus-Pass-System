import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QRScannerProps {
  onScanSuccess: (seatNumber: string) => void;
}

export const QRScanner = ({ onScanSuccess }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanning();
          toast.success('QR Code scanned successfully!');
        },
        (errorMessage) => {
          // Silent fail for continuous scanning
        }
      );

      setIsScanning(true);
      setHasPermission(true);
    } catch (err) {
      console.error("Error starting scanner:", err);
      setHasPermission(false);
      toast.error('Camera permission denied or not available');
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-accent" />
          Scan Your Seat QR Code
        </CardTitle>
        <CardDescription>
          Point your camera at the QR code on your seat
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div 
          id="qr-reader" 
          className={cn(
            "w-full rounded-lg overflow-hidden bg-muted",
            !isScanning && "h-64 flex items-center justify-center"
          )}
        >
          {!isScanning && (
            <div className="text-center p-8">
              <Camera className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Camera preview will appear here</p>
            </div>
          )}
        </div>

        {hasPermission === false && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-start gap-2">
            <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Camera Access Required</p>
              <p className="text-sm">Please enable camera permissions in your browser settings</p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isScanning ? (
            <Button 
              onClick={startScanning} 
              className="w-full bg-accent hover:bg-accent/90"
            >
              <Camera className="mr-2 h-4 w-4" />
              Start Scanning
            </Button>
          ) : (
            <Button 
              onClick={stopScanning} 
              variant="destructive"
              className="w-full"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Stop Scanning
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
