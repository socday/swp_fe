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

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
const s = useStudentDashboard();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={onLogout} />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Welcome, {user.name}</h1>
          <p className="text-gray-600">
            Book facilities and manage your reservations
          </p>
        </div>

        <Tabs value={s.activeTab} onValueChange={s.setActiveTab}>
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
                  <Select value={s.reportType} onValueChange={s.setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hỏng thiết bị">Equipment Issue</SelectItem>
                      <SelectItem value="Vấn đề đặt phòng">Booking Issue</SelectItem>
                      <SelectItem value="Khác">Other</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="Describe the issue..."
                    value={s.reportDescription}
                    onChange={(e) => s.setReportDescription(e.target.value)}
                  />

                  <Button onClick={() => s.handleCreateReport(1)}>
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
                            <TableHead>Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {s.reports.map((r) => (
                            <TableRow key={r.reportId}>
                              <TableCell>{r.title}</TableCell>
                              <TableCell>{r.reportType}</TableCell>
                              <TableCell>
                                <Badge>{r.status}</Badge>
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
