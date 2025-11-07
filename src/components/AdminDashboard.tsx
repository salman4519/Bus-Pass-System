import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeatManagement } from './admin/SeatManagement';
import { PassManagement } from './admin/PassManagement';
import { TripDashboard } from './admin/TripDashboard';
import { QRGenerator } from './admin/QRGenerator';
import { LayoutDashboard, Armchair, CreditCard, QrCode, BarChart3 } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card border-l-4 border-l-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LayoutDashboard className="h-6 w-6 text-accent" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            Manage seats, passes, and track trip attendance
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Admin Tabs */}
      <Tabs defaultValue="trips" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          <TabsTrigger value="trips" className="flex items-center gap-2 py-3">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Trips</span>
          </TabsTrigger>
          <TabsTrigger value="seats" className="flex items-center gap-2 py-3">
            <Armchair className="h-4 w-4" />
            <span className="hidden sm:inline">Seats</span>
          </TabsTrigger>
          <TabsTrigger value="passes" className="flex items-center gap-2 py-3">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Passes</span>
          </TabsTrigger>
          <TabsTrigger value="qr-generator" className="flex items-center gap-2 py-3">
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">QR Gen</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-6">
          <TripDashboard />
        </TabsContent>

        <TabsContent value="seats" className="mt-6">
          <SeatManagement />
        </TabsContent>

        <TabsContent value="passes" className="mt-6">
          <PassManagement />
        </TabsContent>

        <TabsContent value="qr-generator" className="mt-6">
          <QRGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
