import { useState } from 'react';
import { Tabs } from '@/components/Tabs';
import { QRScanner } from '@/components/QRScanner';
import { TripForm } from '@/components/TripForm';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Toaster } from 'react-hot-toast';
import { Bus } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [scannedSeat, setScannedSeat] = useState<{
    seatNumber: string;
    seatPosition: string;
  } | null>(null);

  const handleScanSuccess = async (seatNumber: string) => {
    // In production, fetch seat details from Google Apps Script
    // For now, mock the seat position
    const mockPositions = ['Window Left', 'Window Right', 'Aisle Left', 'Aisle Right', 'Middle'];
    const randomPosition = mockPositions[Math.floor(Math.random() * mockPositions.length)];
    
    setScannedSeat({
      seatNumber,
      seatPosition: randomPosition,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      
      {/* Header */}
      <header className="gradient-primary text-primary-foreground py-6 px-4 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Bus className="h-8 w-8" />
            <h1 className="text-3xl font-bold">College Bus Smart Pass</h1>
          </div>
          <p className="text-center text-primary-foreground/90">
            Automated Seat Validation & Trip Logging System
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Tab Switcher */}
          <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

          {/* User Portal */}
          {activeTab === 'user' && (
            <div className="space-y-6 animate-fade-in">
              <QRScanner onScanSuccess={handleScanSuccess} />
              
              {scannedSeat && (
                <div className="animate-scale-in">
                  <TripForm 
                    seatNumber={scannedSeat.seatNumber}
                    seatPosition={scannedSeat.seatPosition}
                  />
                </div>
              )}
            </div>
          )}

          {/* Admin Portal */}
          {activeTab === 'admin' && (
            <div className="animate-fade-in">
              <AdminDashboard />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>College Bus Smart Pass System © {new Date().getFullYear()}</p>
          <p className="mt-1">Powered by Modern Web Technologies</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
