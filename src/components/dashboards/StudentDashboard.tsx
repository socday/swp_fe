import React from 'react';
import { User } from "../../App";
import { Header } from "../shared/Header";
import { Footer } from "../shared/Footer";

import { RoomSearch } from "../booking/RoomSearch";
import { MyBookings } from "../booking/MyBookings";
import { ScheduleView } from "../booking/ScheduleView";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../ui/card";

import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../ui/table";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";


import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { useStudentDashboard } from "./useStudentDashboard";
import { User } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
const s = useStudentDashboard(user);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-10 flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Welcome, {user.name}</h1>
          <p className="text-gray-600">
            Book facilities and manage your reservations
          </p>
        </div>

        <Tabs value={s.activeTab} onValueChange={s.setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 max-w-md">
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
            <TabsTrigger value="reports"
              className="data-[state=active]:border-2 data-[state=active]:border-orange-500">
              Reports
            </TabsTrigger>

            <TabsTrigger value="my-reports"
              className="data-[state=active]:border-2 data-[state=active]:border-orange-500">
              My Reports
            </TabsTrigger>

          </TabsList>
            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Report</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
<Select
  value={s.selectedBookingId?.toString() ?? ""}
  onValueChange={(v) => s.setSelectedBookingId(Number(v))}
>
  <SelectTrigger>
    <SelectValue placeholder="Select a booking" />
  </SelectTrigger>

  <SelectContent>
    {s.approvedBookings.map(b => (
      <SelectItem key={b.id} value={b.id.toString()}>
        {b.facilityName} · {b.date} · {b.startTime} - {b.endTime}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
                  <Textarea
                    placeholder="Describe the issue..."
                    value={s.reportDescription}
                    onChange={(e) => s.setReportDescription(e.target.value)}
                  />

                  <Button onClick={() => s.handleCreateReport()}>
                    Submit Report
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

              <TabsContent value="my-reports" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>My Reports</CardTitle>
                  </CardHeader>

                  <CardContent>
                    {s.loadingReports ? (
                      <div>Loading...</div>
                    ) : s.reports.length === 0 ? (
                      <div>No reports found</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Report Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                          </TableRow>
                        </TableHeader>

                       <TableBody>
                          {s.reports.map((r) => (
                            <TableRow key={r.reportId}>
                              <TableCell className="font-medium">
                                {r.title}
                              </TableCell>

                              <TableCell className="max-w-xs truncate">
                                {r.description}
                              </TableCell>

                              <TableCell>
                                <Badge variant="outline">
                                  {r.reportType}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                <Badge
                                  className={
                                    r.status === "Resolved"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-yellow-50 text-yellow-700"
                                  }
                                >
                                  {r.status}
                                </Badge>
                              </TableCell>

                              <TableCell>
                                {new Date(r.createdAt).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>

                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
          <TabsContent value="search" className="mt-6">
            <RoomSearch userRole="student" />
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
