import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sunrise, Moon, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logTrip } from '@/lib/api';
import { Switch } from '@/components/ui/switch';

interface TripFormProps {
  seatNumber: string;
  seatPosition: string;
}

export const TripForm = ({ seatNumber, seatPosition }: TripFormProps) => {
  const [formData, setFormData] = useState({
    passId: '',
    fullName: '',
    semester: '',
    program: '',
    destination: '',
    farePaid: true,
  });
  const queryClient = useQueryClient();

  const logTripMutation = useMutation({
    mutationFn: (tripType: 'morning' | 'evening') =>
      logTrip({
        tripType,
        seatNumber,
        seatPosition,
        passId: formData.passId,
        fullName: formData.fullName,
        semester: formData.semester,
        program: formData.program,
        destination: formData.destination,
        farePaid: formData.farePaid,
      }),
    onSuccess: (_response, tripType) => {
      toast.success(`${tripType === 'morning' ? '🕘 Morning' : '🌙 Evening'} trip logged successfully!`);
      setFormData({
        passId: '',
        fullName: '',
        semester: '',
        program: '',
        destination: '',
        farePaid: true,
      });
      queryClient.invalidateQueries({ queryKey: ['trip-list'] });
      queryClient.invalidateQueries({ queryKey: ['trip-counts'] });
    },
    onError: (error, variables) => {
      const tripLabel = variables === 'morning' ? 'Morning' : 'Evening';
      toast.error(`${tripLabel} trip failed: ${(error as Error).message}`);
    },
  });

  const handleSubmit = async (tripType: 'morning' | 'evening') => {
    // Validation
    if (!formData.passId || !formData.fullName || !formData.semester || !formData.program || !formData.destination) {
      toast.error('Please fill in all fields');
      return;
    }
    logTripMutation.mutate(tripType);
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent" />
          Student Trip Information
        </CardTitle>
        <CardDescription>Enter your student details to log your college bus trip</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seat Info Display */}
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Seat Number</p>
              <p className="font-semibold text-accent text-lg">{seatNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Position</p>
              <p className="font-semibold text-lg">{seatPosition}</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="passId">Bus Pass ID *</Label>
            <Input
              id="passId"
              placeholder="Enter your college bus pass ID"
              value={formData.passId}
              onChange={(e) => setFormData({ ...formData, passId: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fullName">Student Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="semester">Semester *</Label>
            <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="4">Semester 4</SelectItem>
                <SelectItem value="5">Semester 5</SelectItem>
                <SelectItem value="6">Semester 6</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="program">Program/Branch *</Label>
            <Select value={formData.program} onValueChange={(value) => setFormData({ ...formData, program: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cse">Computer Science</SelectItem>
                <SelectItem value="ece">Electronics</SelectItem>
                <SelectItem value="me">Mechanical</SelectItem>
                <SelectItem value="ce">Civil</SelectItem>
                <SelectItem value="ee">Electrical</SelectItem>
                <SelectItem value="it">Information Technology</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

          <div>
            <Label htmlFor="destination">Destination *</Label>
            <Input
              id="destination"
              placeholder="Enter your destination (e.g., College Campus, Home)"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              className="mt-1"
            />
          </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div>
            <Label htmlFor="farePaid" className="text-sm font-medium">Bus Fare Paid</Label>
            <p className="text-xs text-muted-foreground">Toggle off if bus fare payment is pending.</p>
          </div>
          <Switch
            id="farePaid"
            checked={formData.farePaid}
            onCheckedChange={(checked) => setFormData({ ...formData, farePaid: checked })}
          />
        </div>

        {/* Trip Type Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={() => handleSubmit('morning')}
            disabled={logTripMutation.isPending}
            className="h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            <Sunrise className="mr-2 h-5 w-5" />
            Morning Trip
          </Button>
          <Button
            onClick={() => handleSubmit('evening')}
            disabled={logTripMutation.isPending}
            className="h-14 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold"
          >
            <Moon className="mr-2 h-5 w-5" />
            Evening Trip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
