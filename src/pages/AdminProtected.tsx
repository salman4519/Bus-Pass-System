import { FormEvent, useEffect, useMemo, useState } from 'react';
import AdminPortal from './AdminPortal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const STORAGE_KEY = 'smartpass-admin-authorized';

const ADMIN_PASSCODE = 'afkar123';

const AdminProtected = () => {
  const [authorized, setAuthorized] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const requiredPassword = useMemo(() => ADMIN_PASSCODE, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handler = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue !== 'true') {
        setAuthorized(false);
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter the admin passcode.');
      return;
    }

    if (password.trim() === requiredPassword) {
      setAuthorized(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, 'true');
      }
      setPassword('');
      return;
    }

    setError('Invalid passcode. Please try again.');
  };

  const handleLogout = () => {
    setAuthorized(false);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md border border-white/10 bg-white/5 text-white backdrop-blur">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-emerald-500/20 p-3">
                <Lock className="h-6 w-6 text-emerald-300" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl font-semibold tracking-wide uppercase">
              Admin Access Required
            </CardTitle>
            <CardDescription className="text-center text-sm text-slate-200/70">
              Enter the administrator passcode to manage seats, passes, and trip data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="admin-passcode" className="text-white/90">
                  Admin Passcode
                </Label>
                <Input
                  id="admin-passcode"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter passcode"
                  className="bg-slate-900/60 border-white/10 text-white"
                  autoComplete="current-password"
                />
                {error && <p className="text-sm text-rose-400">{error}</p>}
              </div>
              <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400">
                Unlock Admin Console
              </Button>
              <p className="text-xs text-center text-white/60">
                Authorized staff only. Contact the transport office if you need access.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-black/50 px-4 py-3 shadow-lg backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between text-sm text-white/80">
          <span>Administrator Mode</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-white/60">Authenticated</span>
            <Separator orientation="vertical" className="h-5 bg-white/20" />
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      <AdminPortal />
    </div>
  );
};

export default AdminProtected;
