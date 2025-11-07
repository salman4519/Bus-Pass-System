import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CheckCircle2, CreditCard, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPass, fetchPasses, PassRecord, removePass } from '@/lib/api';

const PASS_TYPE_OPTIONS = ['Annual', 'Semester', 'Quarterly', 'Monthly'];

export const PassManagement = () => {
  const [newPass, setNewPass] = useState({
    passId: '',
    studentName: '',
    issueDate: '',
    expiryDate: '',
    passType: 'Annual',
    isActive: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: passData, isFetching } = useQuery({
    queryKey: ['pass-list'],
    queryFn: fetchPasses,
    refetchInterval: 300_000,
  });

  const passes = useMemo<PassRecord[]>(() => passData ?? [], [passData]);

  const addPassMutation = useMutation({
    mutationFn: (payload: PassRecord) => createPass(payload),
    onSuccess: () => {
      toast.success('Pass saved successfully');
      setNewPass({
        passId: '',
        studentName: '',
        issueDate: '',
        expiryDate: '',
        passType: 'Annual',
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ['pass-list'] });
    },
    onError: (error: unknown) => {
      toast.error(`Failed to add pass: ${(error as Error).message}`);
    },
  });

  const deletePassMutation = useMutation({
    mutationFn: (passId: string) => removePass(passId),
    onSuccess: () => {
      toast.success('Pass deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['pass-list'] });
    },
    onError: (error: unknown) => {
      toast.error(`Failed to delete pass: ${(error as Error).message}`);
    },
  });

  const addPass = async () => {
    const passId = newPass.passId.trim();
    const studentName = newPass.studentName.trim();

    if (!passId || !studentName || !newPass.issueDate || !newPass.expiryDate) {
      toast.error('Please complete all fields');
      return;
    }

    await addPassMutation.mutateAsync({
      passId,
      studentName,
      issueDate: newPass.issueDate,
      expiryDate: newPass.expiryDate,
      passType: newPass.passType,
      isActive: newPass.isActive,
    });
  };

  const deletePass = async (passId: string) => {
    await deletePassMutation.mutateAsync(passId.trim());
  };

  const filteredPasses = passes.filter(pass =>
    pass.passId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pass.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pass.passType.toLowerCase().includes(searchQuery.toLowerCase())
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
          <CardDescription>Register a new college bus pass for a student</CardDescription>
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
            <div>
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={newPass.issueDate}
                onChange={(e) => setNewPass({ ...newPass, issueDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={newPass.expiryDate}
                onChange={(e) => setNewPass({ ...newPass, expiryDate: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Pass Type</Label>
              <Select
                value={newPass.passType}
                onValueChange={(value) => setNewPass({ ...newPass, passType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {PASS_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="isActive"
                checked={newPass.isActive}
                onCheckedChange={(checked) => setNewPass({ ...newPass, isActive: checked })}
              />
              <Label htmlFor="isActive" className="text-sm font-medium">Active</Label>
            </div>
          </div>
          <Button 
            onClick={addPass} 
            disabled={addPassMutation.isPending}
            className="mt-4 bg-accent hover:bg-accent/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            {addPassMutation.isPending ? 'Saving...' : 'Add Pass'}
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
              <CardDescription>
                {isFetching ? 'Loading passes...' : `Total: ${passes.length} passes`}
              </CardDescription>
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
                className="flex flex-col gap-3 rounded-lg border border-border p-4 hover:border-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold">{pass.passId}</p>
                    <p className="text-sm text-muted-foreground">{pass.studentName}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{pass.passType}</Badge>
                      <div className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {pass.issueDate} → {pass.expiryDate}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    {pass.isActive ? (
                      <div className="inline-flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-4 w-4" /> Active
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 text-destructive">
                        <XCircle className="h-4 w-4" /> Inactive
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deletePass(pass.passId)}
                    disabled={deletePassMutation.isPending}
                    className="hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredPasses.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                {passes.length === 0 && !isFetching ? 'No passes available yet' : 'No passes found'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
