import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Armchair, CheckCircle2, Plus, Trash2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSeat, fetchSeats, removeSeat, SeatRecord } from '@/lib/api';

const SEAT_POSITION_OPTIONS = [
  'Window',
  'Aisle',
  'Middle',
];

const SEAT_STATUS_OPTIONS = ['Open', 'Booked'];
const SEAT_SECTION_OPTIONS = ['Front', 'Middle', 'Back'];

export const SeatManagement = () => {
  const queryClient = useQueryClient();
  const [newSeat, setNewSeat] = useState({
    seatNumber: '',
    position: 'Window',
    status: 'Open',
    section: 'Front',
    row: '',
    available: true,
  });

  const { data: seatsData, isFetching } = useQuery({
    queryKey: ['seat-list'],
    queryFn: fetchSeats,
    refetchInterval: 300_000,
  });

  const seats = useMemo<SeatRecord[]>(() => seatsData ?? [], [seatsData]);

  const addSeatMutation = useMutation({
    mutationFn: (payload: SeatRecord) => createSeat(payload),
    onSuccess: () => {
      toast.success('Seat saved successfully');
      setNewSeat({
        seatNumber: '',
        position: 'Window',
        status: 'Open',
        section: 'Front',
        row: '',
        available: true,
      });
      queryClient.invalidateQueries({ queryKey: ['seat-list'] });
    },
    onError: (error: unknown) => {
      toast.error(`Failed to add seat: ${(error as Error).message}`);
    },
  });

  const deleteSeatMutation = useMutation({
    mutationFn: (seatNumber: string) => removeSeat(seatNumber),
    onSuccess: () => {
      toast.success('Seat deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['seat-list'] });
    },
    onError: (error: unknown) => {
      toast.error(`Failed to delete seat: ${(error as Error).message}`);
    },
  });

  const addSeat = async () => {
    const seatNumber = newSeat.seatNumber.trim();
    const row = newSeat.row.trim();

    if (!seatNumber) {
      toast.error('Seat number is required');
      return;
    }

    await addSeatMutation.mutateAsync({
      seatNumber,
      position: newSeat.position,
      status: newSeat.status,
      section: newSeat.section,
      row,
      available: newSeat.available,
    });
  };

  const deleteSeat = async (seatNumber: string) => {
    await deleteSeatMutation.mutateAsync(seatNumber.trim());
  };

  return (
    <div className="space-y-6">
      {/* Add Seat Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            Add New Seat
          </CardTitle>
          <CardDescription>Register a new seat in the bus system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Label htmlFor="seatNumber">Seat Number</Label>
              <Input
                id="seatNumber"
                placeholder="e.g., S105"
                value={newSeat.seatNumber}
                onChange={(e) => setNewSeat({ ...newSeat, seatNumber: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Position</Label>
              <Select
                value={newSeat.position}
                onValueChange={(value) => setNewSeat({ ...newSeat, position: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose position" />
                </SelectTrigger>
                <SelectContent>
                  {SEAT_POSITION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={newSeat.status}
                onValueChange={(value) => setNewSeat({ ...newSeat, status: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Seat status" />
                </SelectTrigger>
                <SelectContent>
                  {SEAT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Select
                value={newSeat.section}
                onValueChange={(value) => setNewSeat({ ...newSeat, section: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  {SEAT_SECTION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="row">Row</Label>
              <Input
                id="row"
                placeholder="e.g., 3"
                value={newSeat.row}
                onChange={(e) => setNewSeat({ ...newSeat, row: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="available"
                checked={newSeat.available}
                onCheckedChange={(checked) => setNewSeat({ ...newSeat, available: checked })}
              />
              <Label htmlFor="available" className="text-sm font-medium">Available for booking</Label>
            </div>
          </div>
          <Button 
            onClick={addSeat} 
            disabled={addSeatMutation.isPending}
            className="mt-4 bg-accent hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addSeatMutation.isPending ? 'Saving...' : 'Add Seat'}
          </Button>
        </CardContent>
      </Card>

      {/* Seats List */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Armchair className="h-5 w-5 text-accent" />
            Registered Seats
          </CardTitle>
          <CardDescription>
            {isFetching ? 'Loading seats...' : `Total: ${seats.length} seats`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {seats.map((seat) => (
              <div 
                key={seat.seatNumber}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Armchair className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Seat {seat.seatNumber}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{seat.position}</Badge>
                      <Badge variant={seat.status === 'Booked' ? 'destructive' : 'outline'}>
                        {seat.status}
                      </Badge>
                      <Badge variant="outline">{seat.section}</Badge>
                      {seat.row && (
                        <Badge variant="outline">Row {seat.row}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    {seat.available ? (
                      <div className="inline-flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-4 w-4" />
                        Available
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-destructive">
                        <XCircle className="h-4 w-4" />
                        Unavailable
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteSeat(seat.seatNumber)}
                    disabled={deleteSeatMutation.isPending}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {seats.length === 0 && !isFetching && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No seats registered yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
