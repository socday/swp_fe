import { useState } from "react";
import type { User } from "../../App";
import { Header } from "../shared/Header";
import { Footer } from "../shared/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { NotificationsPage } from "../notifications/NotificationsPage";

import { AdminScheduleView } from "../admin/AdminScheduleView";
import { RoomSearch } from "../booking/RoomSearch";
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
  const [showNotifications, setShowNotifications] = useState(false);

  if (showNotifications) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header user={user} onLogout={onLogout} onNavigateToNotifications={() => setShowNotifications(true)} />
        <NotificationsPage onBack={() => setShowNotifications(false)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header user={user} onLogout={onLogout} onNavigateToNotifications={() => setShowNotifications(true)} />

<main className="w-full px-8 py-8 flex-grow">
  {/* HEADER GIỮ max width */}
  <div className="max-w-7xl mx-auto mb-6">
    <h2 className="text-2xl mb-2">Welcome, {user.name}</h2>
    <p className="text-gray-600">
      Manage facility bookings and operations
    </p>
  </div>

  {/* TABS + CONTENT FULL WIDTH */}
  <div className="w-full">
    <Tabs
      value={state.activeTab}
      onValueChange={state.setActiveTab}
      className="w-full"
    >
      <TabsList
        className="
          flex flex-row gap-2
          bg-white p-2 rounded-lg shadow-sm border
          w-full
        "
      >
        <TabsTrigger value="approvals"
        className="data-[state=active]:border-4 data-[state=active]:border-orange-500"
        >Approvals</TabsTrigger>
        <TabsTrigger value="create-booking"
        className="data-[state=active]:border-4 data-[state=active]:border-orange-500"
        >Create Booking</TabsTrigger>
        <TabsTrigger value="schedule"
        className="data-[state=active]:border-4 data-[state=active]:border-orange-500"
        >Schedule</TabsTrigger>
        <TabsTrigger value="history"
        className="data-[state=active]:border-4 data-[state=active]:border-orange-500"
        >History</TabsTrigger>
        <TabsTrigger value="security"
        className="data-[state=active]:border-4 data-[state=active]:border-orange-500"
        >Security Tasks</TabsTrigger>
        <TabsTrigger value="reports"
        className="data-[state=active]:border-4 data-[state=active]:border-orange-500"
        >Reports</TabsTrigger>
      </TabsList>

      <div className="mt-6 w-full">
        <TabsContent value="approvals">
          <StaffApprovalsUI {...state} />
        </TabsContent>

        <TabsContent value="create-booking">
          <RoomSearch userRole="staff" />
        </TabsContent>

        <TabsContent value="schedule">
          <AdminScheduleView />
        </TabsContent>

        <TabsContent value="history">
          <StaffHistoryUI {...state} />
        </TabsContent>

        <TabsContent value="security">
          <StaffSecurityTasksUI {...state} />
        </TabsContent>

        <TabsContent value="reports">
          <StaffReportsUI {...state} />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</main>


      <Footer />
    </div>
  );
}