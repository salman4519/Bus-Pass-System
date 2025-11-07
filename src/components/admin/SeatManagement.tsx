import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Armchair, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Seat {
  seatNumber: string;
  position: string;
}

export const SeatManagement = () => {
  const [seats, setSeats] = useState<Seat[]>([
    { seatNumber: '1', position: 'Window Left' },
    { seatNumber: '2', position: 'Aisle Left' },
  ]);
  const [newSeat, setNewSeat] = useState({ seatNumber: '', position: '' });

  const addSeat = async () => {
    if (!newSeat.seatNumber || !newSeat.position) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // Here you would call Google Apps Script endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSeats([...seats, newSeat]);
      setNewSeat({ seatNumber: '', position: '' });
      toast.success('Seat added successfully');
    } catch (error) {
      toast.error('Failed to add seat');
    }
  };

  const deleteSeat = async (seatNumber: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setSeats(seats.filter(s => s.seatNumber !== seatNumber));
      toast.success('Seat deleted successfully');
    } catch (error) {
      toast.error('Failed to delete seat');
    }
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
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seatNumber">Seat Number</Label>
              <Input
                id="seatNumber"
                placeholder="e.g., 15"
                value={newSeat.seatNumber}
                onChange={(e) => setNewSeat({ ...newSeat, seatNumber: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position">Seat Position</Label>
              <Input
                id="position"
                placeholder="e.g., Window Right"
                value={newSeat.position}
                onChange={(e) => setNewSeat({ ...newSeat, position: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={addSeat} 
            className="mt-4 bg-accent hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Seat
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
          <CardDescription>Total: {seats.length} seats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {seats.map((seat) => (
              <div 
                key={seat.seatNumber}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Armchair className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">Seat {seat.seatNumber}</p>
                    <p className="text-sm text-muted-foreground">{seat.position}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteSeat(seat.seatNumber)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
