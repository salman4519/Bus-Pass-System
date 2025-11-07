import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sunrise, Moon, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (tripType: 'morning' | 'evening') => {
    // Validation
    if (!formData.passId || !formData.fullName || !formData.semester || !formData.program) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    try {
      // Here you would call your Google Apps Script endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const tripData = {
        timestamp: new Date().toISOString(),
        tripType,
        seatNumber,
        seatPosition,
        ...formData,
      };

      console.log('Trip logged:', tripData);
      toast.success(`${tripType === 'morning' ? '🕘 Morning' : '🌙 Evening'} trip logged successfully!`);
      
      // Reset form
      setFormData({
        passId: '',
        fullName: '',
        semester: '',
        program: '',
      });
    } catch (error) {
      toast.error('Failed to log trip. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent" />
          Trip Information
        </CardTitle>
        <CardDescription>Fill in your details to log your trip</CardDescription>
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
            <Label htmlFor="passId">Pass ID *</Label>
            <Input
              id="passId"
              placeholder="Enter your pass ID"
              value={formData.passId}
              onChange={(e) => setFormData({ ...formData, passId: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="fullName">Full Name *</Label>
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

        {/* Trip Type Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={() => handleSubmit('morning')}
            disabled={isSubmitting}
            className="h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            <Sunrise className="mr-2 h-5 w-5" />
            Morning Trip
          </Button>
          <Button
            onClick={() => handleSubmit('evening')}
            disabled={isSubmitting}
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
