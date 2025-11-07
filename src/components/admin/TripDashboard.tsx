import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sunrise, Moon, Download, RefreshCw, CheckCircle2, XCircle, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchTripCounts, fetchTrips, TripRecord } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const TripDashboard = () => {
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Trip Type', 'Seat', 'Pass ID', 'Name', 'Semester', 'Program', 'Destination', 'Fare Paid'];
    const rows = (tripData ?? []).map(t => [
      new Date(t.timestamp).toLocaleString(),
      t.tripType,
      t.seatNumber,
      t.passId,
      t.name,
      t.semester,
      t.program,
      t.destination,
      t.farePaid ? 'TRUE' : 'FALSE',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trips-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };
  
  const {
    data: tripCounts,
    isFetching: isCountsFetching,
    refetch: refetchCounts,
  } = useQuery({
    queryKey: ['trip-counts'],
    queryFn: fetchTripCounts,
    refetchInterval: 60_000,
    onError: (error: unknown) => {
      toast.error(`Failed to load trip counts: ${(error as Error).message}`);
    },
  });

  const {
    data: tripData,
    isFetching: isTripsFetching,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: ['trip-list'],
    queryFn: fetchTrips,
    refetchInterval: 60_000,
    onError: (error: unknown) => {
      toast.error(`Failed to load trip list: ${(error as Error).message}`);
    },
  });

  const morningCount = tripCounts?.morning ?? 0;
  const eveningCount = tripCounts?.evening ?? 0;
  const isRefreshing = isCountsFetching || isTripsFetching;

  const refreshAll = async () => {
    try {
      await Promise.all([refetchCounts(), refetchTrips()]);
      toast.success('Trip data refreshed');
    } catch (error) {
      toast.error(`Failed to refresh trips: ${(error as Error).message}`);
    }
  };

  const trips = useMemo<TripRecord[]>(() => tripData ?? [], [tripData]);

  return (
    <div className="space-y-6">
      {/* Trip Counters */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="shadow-card border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sunrise className="h-5 w-5 text-amber-500" />
              Morning Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-amber-500">{morningCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Students traveled this morning</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-l-4 border-l-indigo-500">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Moon className="h-5 w-5 text-indigo-500" />
              Evening Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-indigo-500">{eveningCount}</p>
            <p className="text-sm text-muted-foreground mt-1">Students traveled this evening</p>
          </CardContent>
        </Card>
      </div>

      {/* Trip Table */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Today's Bus Trips</CardTitle>
              <CardDescription>Real-time student bus trip attendance tracking</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={refreshAll} 
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={exportToCSV}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Time</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Trip</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Seat</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Pass ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm hidden lg:table-cell">Semester</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm hidden xl:table-cell">Program</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm hidden md:table-cell">Destination</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Fare</th>
                </tr>
              </thead>
              <tbody>
                {trips.map((trip, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm">{new Date(trip.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${(() => {
                        const type = (trip.tripType || '').toLowerCase();
                        if (type === 'morning') {
                          return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
                        }
                        if (type === 'evening') {
                          return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
                        }
                        return 'bg-muted text-muted-foreground';
                      })()}`}>
                        {(() => {
                          const type = (trip.tripType || '').toLowerCase();
                          if (type === 'morning') return <Sunrise className="h-3 w-3" />;
                          if (type === 'evening') return <Moon className="h-3 w-3" />;
                          return <MapPin className="h-3 w-3" />;
                        })()}
                        {trip.tripType || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{trip.seatNumber}</td>
                    <td className="py-3 px-4 text-sm">{trip.passId}</td>
                    <td className="py-3 px-4 text-sm">{trip.name}</td>
                    <td className="py-3 px-4 text-sm hidden lg:table-cell">{trip.semester}</td>
                    <td className="py-3 px-4 text-sm hidden xl:table-cell">{trip.program}</td>
                    <td className="py-3 px-4 text-sm hidden md:table-cell">{trip.destination}</td>
                    <td className="py-3 px-4 text-sm">
                      {trip.farePaid ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <CheckCircle2 className="h-4 w-4" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <XCircle className="h-4 w-4" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trips.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No trips recorded yet today
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
