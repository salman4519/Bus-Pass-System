import { FormEvent, useMemo, useState } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { TripForm } from '@/components/TripForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { fetchSeat, SeatRecord } from '@/lib/api';
import { Link } from 'react-router-dom';
import { ArrowRight, BusFront, Compass, Scan, Sparkles, Wand2 } from 'lucide-react';

const parseSeatLabel = (rawValue: string): string | null => {
  if (!rawValue) return null;
  const cleaned = rawValue.trim();
  if (!cleaned) return null;
  return cleaned.toUpperCase();
};

const infoPoints = [
  {
    title: 'Scan effortlessly',
    description: 'Point your camera at the QR code on your bus seat. The system instantly recognizes your seat number.',
    icon: <Scan className="h-5 w-5" />,
  },
  {
    title: 'Confirm seat details',
    description: 'Your seat information is fetched from the college transport database, so you can verify your booking instantly.',
    icon: <Compass className="h-5 w-5" />,
  },
  {
    title: 'Log your bus trip',
    description: 'Select Morning or Evening trip to record your commute. Get instant confirmation when your trip is logged.',
    icon: <Sparkles className="h-5 w-5" />,
  },
];

const tips = [
  'Hold the camera steady with the QR fully visible inside the square.',
  'If the QR is damaged, type your seat number below as a fallback.',
  'Use landscape orientation on tablets for a wider scanning frame.',
];

const ManualSeatForm = ({
  seatNumber,
  setSeatNumber,
  isLoading,
  onSubmit,
}: {
  seatNumber: string;
  setSeatNumber: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}) => (
  <form
    className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    onSubmit={(event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!seatNumber.trim()) {
        toast.error('Enter a seat number to continue');
        return;
      }
      onSubmit();
    }}
  >
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <label htmlFor="manual-seat" className="text-sm font-medium uppercase tracking-[0.2em] text-white/70">
        Manual Entry
      </label>
      <div className="flex w-full flex-1 gap-2">
        <Input
          id="manual-seat"
          placeholder="Type seat number if QR is unreadable"
          value={seatNumber}
          onChange={(event) => setSeatNumber(event.target.value.toUpperCase())}
          className="h-12 bg-white/90 text-slate-900 placeholder:text-slate-500"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="shrink-0 bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
        >
          {isLoading ? 'Loading…' : 'Lookup'}
        </Button>
      </div>
    </div>
  </form>
);

const UserPortal = () => {
  const [seatInfo, setSeatInfo] = useState<SeatRecord | null>(null);
  const [lastScannedValue, setLastScannedValue] = useState('');

  const seatLookup = useMutation({
    mutationFn: (seatNumber: string) => fetchSeat(seatNumber),
    onSuccess: (data) => {
      setSeatInfo(data);
      toast.success(`Seat ${data.seatNumber} ready to log!`);
    },
    onError: (error: unknown) => {
      setSeatInfo(null);
      toast.error((error as Error).message || 'Seat lookup failed');
    },
  });

  const handleSeatLookup = (seatNumber: string) => {
    const normalized = seatNumber.trim().toUpperCase();
    if (!normalized) {
      toast.error('Seat number is empty. Try scanning again.');
      return;
    }

    setLastScannedValue(normalized);
    seatLookup.mutate(normalized);
  };

  const handleScanSuccess = (rawValue: string) => {
    const seatNumber = parseSeatLabel(rawValue);
    if (!seatNumber) {
      toast.error('QR code did not contain a seat number. Try again.');
      return;
    }

    handleSeatLookup(seatNumber);
  };

  const handleFallbackSubmit = () => {
    const seatNumber = parseSeatLabel(lastScannedValue || seatInfo?.seatNumber || '');
    if (!seatNumber) {
      toast.error('Please provide a valid seat number');
      return;
    }

    handleSeatLookup(seatNumber);
  };

  const manualSeatNumber = useMemo(() => lastScannedValue, [lastScannedValue]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-36 -left-40 h-72 w-72 rounded-full bg-emerald-500/40 blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-32 h-64 w-64 rounded-full bg-cyan-400/40 blur-3xl animate-float-slower" />
        <div className="absolute bottom-[-8rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative">
        <header className="px-4 py-10 sm:py-14">
          <div className="container mx-auto flex flex-col items-center gap-6 text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-emerald-200">
              <Wand2 className="h-4 w-4" />
              SmartPass
            </div>
            <h1 className="font-display text-4xl uppercase tracking-[0.08em] text-white drop-shadow-lg sm:text-5xl md:text-6xl">
              College Bus Pass Tracker
            </h1>
            <p className="max-w-2xl text-lg text-white/70 md:text-xl">
              Track your college bus trips with ease. Scan your seat QR code to log morning and evening commutes instantly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-emerald-100">
                <Link to="/admin" className="inline-flex items-center gap-2">
                  Admin Console
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70">
                <BusFront className="h-4 w-4" />
                Student Bus Tracking
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto grid gap-10 px-4 pb-16 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="space-y-8">
            <Card className="border-0 bg-white/5 shadow-xl shadow-emerald-500/10 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Scan className="h-6 w-6 text-emerald-300" />
                  Scan Your Seat QR
                </CardTitle>
                <CardDescription className="text-white/70">
                  Instantly validate your seat information from the college transport database.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <QRScanner onScanSuccess={handleScanSuccess} />

                <ManualSeatForm
                  seatNumber={manualSeatNumber}
                  setSeatNumber={setLastScannedValue}
                  isLoading={seatLookup.isPending}
                  onSubmit={handleFallbackSubmit}
                />

                <ul className="grid gap-4 sm:grid-cols-3">
                  {infoPoints.map((item) => (
                    <li
                      key={item.title}
                      className="group rounded-xl border border-white/5 bg-white/5 p-4 transition hover:border-emerald-400/60 hover:bg-emerald-400/10"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
                        {item.icon}
                      </div>
                      <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/60">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/5 shadow-xl shadow-cyan-400/10 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Compass className="h-6 w-6 text-cyan-300" />
                  Smart Scanning Tips
                </CardTitle>
                <CardDescription className="text-white/70">
                  Get a clean scan every time and keep the line moving.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="grid gap-4 sm:grid-cols-3">
                  {tips.map((tip, index) => (
                    <li key={tip} className="rounded-xl border border-white/5 bg-white/5 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/40">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm text-white/70">{tip}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-6">
            {seatInfo ? (
              <div className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-emerald-500/40">
                  <CardHeader>
                    <CardTitle className="text-2xl">Seat {seatInfo.seatNumber}</CardTitle>
                    <CardDescription className="text-emerald-100">
                      {seatInfo.position} · {seatInfo.section} section · Row {seatInfo.row || '—'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-emerald-50">
                    <p>
                      Seat details are synced with the college transport database. Status: {seatInfo.status}. {seatInfo.available ? 'This seat is currently available for booking.' : 'This seat is currently unavailable.'}
                    </p>
                    <Button
                      variant="secondary"
                      className="bg-white text-emerald-600 hover:bg-emerald-100"
                      onClick={() => handleSeatLookup(seatInfo.seatNumber)}
                    >
                      Refresh Seat Info
                    </Button>
                  </CardContent>
                </Card>

                <TripForm
                  seatNumber={seatInfo.seatNumber}
                  seatPosition={seatInfo.position}
                />
              </div>
            ) : (
              <Card className="border-0 bg-white/5 text-white shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BusFront className="h-6 w-6 text-emerald-300" />
                    Ready to Log a Trip?
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Scan your seat QR code or enter your seat number to start tracking your college bus trip.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-white/60">
                  <p>
                    Once your seat is validated, the trip form will appear here. Enter your student details to log your morning or evening bus trip.
                  </p>
                </CardContent>
              </Card>
            )}
          </aside>
        </main>

        <footer className="border-t border-white/10 bg-white/5 py-6 text-center text-sm text-white/60 backdrop-blur">
          <p>College Bus Pass System © {new Date().getFullYear()} – Track your daily commutes to campus.</p>
        </footer>
      </div>
    </div>
  );
};

export default UserPortal;

