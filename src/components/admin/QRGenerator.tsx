import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Download } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { toast } from 'react-hot-toast';

export const QRGenerator = () => {
  const [startSeat, setStartSeat] = useState('');
  const [endSeat, setEndSeat] = useState('');
  const [qrCodes, setQrCodes] = useState<{ seat: string; dataUrl: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCodes = async () => {
    const start = parseInt(startSeat);
    const end = parseInt(endSeat);

    if (!start || !end || start > end || start < 1) {
      toast.error('Please enter valid seat numbers');
      return;
    }

    if (end - start > 50) {
      toast.error('Maximum 50 seats at a time');
      return;
    }

    setIsGenerating(true);
    const codes: { seat: string; dataUrl: string }[] = [];

    try {
      for (let i = start; i <= end; i++) {
        const seatNumber = i.toString();
        const dataUrl = await QRCodeLib.toDataURL(seatNumber, {
          width: 200,
          margin: 2,
          color: {
            dark: '#0a1628',
            light: '#ffffff'
          }
        });
        codes.push({ seat: seatNumber, dataUrl });
      }

      setQrCodes(codes);
      toast.success(`Generated ${codes.length} QR codes`);
    } catch (error) {
      toast.error('Failed to generate QR codes');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = (seat: string, dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `seat-${seat}-qr.png`;
    link.click();
    toast.success(`QR code for seat ${seat} downloaded`);
  };

  const downloadAll = () => {
    qrCodes.forEach(({ seat, dataUrl }) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `seat-${seat}-qr.png`;
        link.click();
      }, 100 * parseInt(seat));
    });
    toast.success('Downloading all QR codes');
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-accent" />
            QR Code Generator
          </CardTitle>
          <CardDescription>Generate QR codes for seat ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startSeat">Start Seat Number</Label>
              <Input
                id="startSeat"
                type="number"
                placeholder="e.g., 1"
                value={startSeat}
                onChange={(e) => setStartSeat(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="endSeat">End Seat Number</Label>
              <Input
                id="endSeat"
                type="number"
                placeholder="e.g., 40"
                value={endSeat}
                onChange={(e) => setEndSeat(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={generateQRCodes}
            disabled={isGenerating}
            className="mt-4 bg-accent hover:bg-accent/90"
          >
            <QrCode className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : 'Generate QR Codes'}
          </Button>
        </CardContent>
      </Card>

      {/* QR Codes Grid */}
      {qrCodes.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Generated QR Codes</CardTitle>
                <CardDescription>{qrCodes.length} codes ready to download</CardDescription>
              </div>
              <Button onClick={downloadAll} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {qrCodes.map(({ seat, dataUrl }) => (
                <div 
                  key={seat}
                  className="flex flex-col items-center p-4 border border-border rounded-lg hover:border-accent transition-colors"
                >
                  <img 
                    src={dataUrl} 
                    alt={`Seat ${seat} QR Code`}
                    className="w-full h-auto mb-2"
                  />
                  <p className="font-semibold text-sm mb-2">Seat {seat}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQR(seat, dataUrl)}
                    className="w-full"
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
