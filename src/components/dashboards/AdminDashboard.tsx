import { useState } from 'react';
import { User } from '../../App';
import { Header } from '../shared/Header';
import { Footer } from '../shared/Footer';
import { FacilityManagement } from '../admin/FacilityManagement';
import { BookingApprovals } from '../admin/BookingApprovals';
import { UsageReports } from '../admin/UsageReports';
import { AdminScheduleView } from '../admin/AdminScheduleView';
import { UserManagement } from '../admin/UserManagement';
import { AdvancedStatistics } from '../admin/AdvancedStatistics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Users, BarChart3, ClipboardList, Calendar, Building2, FileText } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('approvals');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={onLogout} />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage facilities, users, bookings, and view analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 max-w-4xl">
            <TabsTrigger value="approvals" className="flex items-center gap-2 data-[state=active]:border-2 data-[state=active]:border-orange-500">
              <ClipboardList className="w-4 h-4" />
              Approvals
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2 data-[state=active]:border-2 data-[state=active]:border-orange-500">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="facilities" className="flex items-center gap-2 data-[state=active]:border-2 data-[state=active]:border-orange-500">
              <Building2 className="w-4 h-4" />
              Facilities
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:border-2 data-[state=active]:border-orange-500">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2 data-[state=active]:border-2 data-[state=active]:border-orange-500">
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:border-2 data-[state=active]:border-orange-500">
              <FileText className="w-4 h-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="mt-6">
            <BookingApprovals />
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <AdminScheduleView />
          </TabsContent>

          <TabsContent value="facilities" className="mt-6">
            <FacilityManagement />
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="statistics" className="mt-6">
            <AdvancedStatistics />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <UsageReports />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}