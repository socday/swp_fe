import { Header } from "../shared/Header";
import { Footer } from "../shared/Footer";

import { RoomSearch } from "../booking/RoomSearch";
import { MyBookings } from "../booking/MyBookings";
import { ScheduleView } from "../booking/ScheduleView";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { User } from "../../App";
import { useLecturerDashboard } from "./useLecturerDashboard";

interface LecturerDashboardProps {
  user: User;
  onLogout: () => void;
}

export function LecturerDashboard({ user, onLogout }: LecturerDashboardProps) {
  const { activeTab, handleTabChange } = useLecturerDashboard(user, onLogout);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Welcome, {user.name}</h1>
          <p className="text-gray-600">
            Manage your facility bookings and class schedules
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger
              value="search"
              className="data-[state=active]:border-2 data-[state=active]:border-orange-500"
            >
              Search Rooms
            </TabsTrigger>

            <TabsTrigger
              value="bookings"
              className="data-[state=active]:border-2 data-[state=active]:border-orange-500"
            >
              My Bookings
            </TabsTrigger>

            <TabsTrigger
              value="schedule"
              className="data-[state=active]:border-2 data-[state=active]:border-orange-500"
            >
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="search" className="mt-6">
            <RoomSearch userRole="lecturer" />
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <MyBookings userId={user.id} />
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <ScheduleView userId={user.id} />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
