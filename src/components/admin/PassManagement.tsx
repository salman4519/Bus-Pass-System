import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Pass {
  passId: string;
  studentName: string;
}

export const PassManagement = () => {
  const [passes, setPasses] = useState<Pass[]>([
    { passId: 'PASS001', studentName: 'John Doe' },
    { passId: 'PASS002', studentName: 'Jane Smith' },
  ]);
  const [newPass, setNewPass] = useState({ passId: '', studentName: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const addPass = async () => {
    if (!newPass.passId || !newPass.studentName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPasses([...passes, newPass]);
      setNewPass({ passId: '', studentName: '' });
      toast.success('Pass added successfully');
    } catch (error) {
      toast.error('Failed to add pass');
    }
  };

  const deletePass = async (passId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPasses(passes.filter(p => p.passId !== passId));
      toast.success('Pass deleted successfully');
    } catch (error) {
      toast.error('Failed to delete pass');
    }
  };

  const filteredPasses = passes.filter(pass =>
    pass.passId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pass.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Add Pass Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            Add New Pass
          </CardTitle>
          <CardDescription>Register a new student pass</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passId">Pass ID</Label>
              <Input
                id="passId"
                placeholder="e.g., PASS001"
                value={newPass.passId}
                onChange={(e) => setNewPass({ ...newPass, passId: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                placeholder="e.g., John Doe"
                value={newPass.studentName}
                onChange={(e) => setNewPass({ ...newPass, studentName: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <Button 
            onClick={addPass} 
            className="mt-4 bg-accent hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Pass
          </Button>
        </CardContent>
      </Card>

      {/* Passes List */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-accent" />
                Registered Passes
              </CardTitle>
              <CardDescription>Total: {passes.length} passes</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search passes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPasses.map((pass) => (
              <div 
                key={pass.passId}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{pass.passId}</p>
                    <p className="text-sm text-muted-foreground">{pass.studentName}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deletePass(pass.passId)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {filteredPasses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No passes found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
