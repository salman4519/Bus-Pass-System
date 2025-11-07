import { Link } from 'react-router-dom';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Gauge, Layers3, ShieldCheck } from 'lucide-react';

const highlights = [
  {
    title: 'Live Google Sheets sync',
    description: 'Every trip, seat, and pass update hits your sheet in real time without manual refreshes.',
    icon: <CalendarClock className="h-6 w-6 text-emerald-500" />,
  },
  {
    title: 'Zero setup downtime',
    description: 'Deploy the Apps Script once and manage all data inside this dashboard with instant feedback.',
    icon: <Gauge className="h-6 w-6 text-cyan-400" />,
  },
  {
    title: 'Granular controls',
    description: 'Manage seats, passes, and trips from dedicated tabs designed for speed and clarity.',
    icon: <Layers3 className="h-6 w-6 text-violet-400" />,
  },
  {
    title: 'Trustworthy logs',
    description: 'Download CSV exports and keep compliance-ready attendance trails for your institution.',
    icon: <ShieldCheck className="h-6 w-6 text-emerald-500" />,
  },
];

const AdminPortal = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-10 h-72 w-72 rounded-full bg-cyan-500/30 blur-3xl animate-float-slow" />
        <div className="absolute top-1/2 left-[-10%] h-80 w-80 rounded-full bg-emerald-500/40 blur-3xl animate-float-slower" />
        <div className="absolute bottom-[-6rem] right-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-violet-500/30 blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative">
        <header className="px-4 py-10">
          <div className="container mx-auto flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.35em] text-emerald-200">
                Admin Suite
              </div>
              <div>
                <h1 className="font-display text-4xl uppercase tracking-[0.1em] drop-shadow-lg sm:text-5xl">
                  SmartPass Command Center
                </h1>
                <p className="mt-3 max-w-2xl text-base text-white/70 sm:text-lg">
                  Monitor live trips, manage seat allocations, and keep passes up to date. Everything you change reflects instantly inside your Google Sheet dataset.
                </p>
              </div>
            </div>
            <Button asChild size="lg" variant="secondary" className="bg-white text-slate-900 hover:bg-emerald-100">
              <Link to="/" className="inline-flex items-center gap-2">
                Back to Student Portal
              </Link>
            </Button>
          </div>
        </header>

        <section className="container mx-auto px-4 pb-10">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <Card key={item.title} className="border-white/5 bg-white/5 shadow-xl backdrop-blur">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="rounded-xl bg-white/10 p-3">
                    {item.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">{item.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm text-white/60">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <main className="container mx-auto px-4 pb-20">
          <Card className="border-white/5 bg-white/10 backdrop-blur">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-2xl text-white">Operational Dashboard</CardTitle>
              <CardDescription className="text-white/70">
                Switch between trips, seats, passes, and QR generator to control your transport programme.
              </CardDescription>
            </CardHeader>
            <CardContent className="bg-slate-950/40">
              <AdminDashboard />
            </CardContent>
          </Card>
        </main>

        <footer className="border-t border-white/10 bg-white/5 py-6 text-center text-sm text-white/60 backdrop-blur">
          <p>
            SmartPass Campus Sync Admin · Changes propagate instantly to your Google Sheets backend.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminPortal;

