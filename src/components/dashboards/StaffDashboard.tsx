import { User } from "../../App";
import { Header } from "../shared/Header";
import { Footer } from "../shared/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { AdminScheduleView } from "../admin/AdminScheduleView";
import { StaffApprovalsUI } from "./ui/StaffApprovalsUI";
import { StaffHistoryUI } from "./ui/StaffHistoryUI";
import { StaffSecurityTasksUI } from "./ui/StaffSecurityTasksUI";
import { StaffReportsUI } from "./ui/StaffReportsUI";

import { useStaffDashboard } from "./useStaffDashboard";

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const state = useStaffDashboard(); // toàn bộ logic được gom vào từ đây

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} onLogout={onLogout} title="Staff Dashboard" />

      <main className="w-full px-8 py-8 flex-grow">
        <div className="max-w-7xl mx-auto mb-6">
          <h2 className="text-2xl mb-2">Welcome, {user.name}</h2>
          <p className="text-gray-600">
            Manage facility bookings and operations
          </p>
        </div>

        <div className="flex gap-8 px-4">
          <Tabs value={state.activeTab} onValueChange={state.setActiveTab} className="flex-1">
            <div className="flex gap-8">
              <TabsList className="flex flex-col h-fit space-y-2 bg-white p-4 rounded-lg shadow-sm border min-w-[200px]">
                <TabsTrigger value="approvals" className="w-full justify-start px-4 py-3">Approvals</TabsTrigger>
                <TabsTrigger value="schedule" className="w-full justify-start px-4 py-3">Schedule</TabsTrigger>
                <TabsTrigger value="history" className="w-full justify-start px-4 py-3">History</TabsTrigger>
                <TabsTrigger value="security" className="w-full justify-start px-4 py-3">Security</TabsTrigger>
                <TabsTrigger value="reports" className="w-full justify-start px-4 py-3">Reports</TabsTrigger>
              </TabsList>

              <div className="flex-1">
                <TabsContent value="approvals" className="mt-0">
                  <StaffApprovalsUI {...state} />
                </TabsContent>

                <TabsContent value="schedule" className="mt-0">
                  <AdminScheduleView />
                </TabsContent>

                <TabsContent value="history" className="mt-0">
                  <StaffHistoryUI {...state} />
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <StaffSecurityTasksUI {...state} />
                </TabsContent>

                <TabsContent value="reports" className="mt-0">
                  <StaffReportsUI {...state} />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}