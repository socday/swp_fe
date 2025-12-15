import { Header } from "../shared/Header";
import { Footer } from "../shared/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { RoomImageGallery } from "../shared/RoomImageGallery";
import { getRoomImages } from "../../lib/roomImages";

import { useSecurityDashboard } from "./useSecurityDashboard";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "../ui/dialog";

import { Table, TableHead, TableRow, TableCell, TableBody } from "../ui/table";

import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";

import {
  Shield,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { AdminScheduleView } from "../admin/AdminScheduleView";

export function SecurityDashboard({ user, onLogout }) {
  const s = useSecurityDashboard(user);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={onLogout} title="Security Dashboard" />

      <div className="max-w-7xl mx-auto px-4 py-8 flex-grow">
        <h2 className="text-[30px] mb-2">Welcome, {user.name}</h2>
        <p className="text-gray-600 mb-6">Manage security tasks and inspections</p>

        {/* Tabs */}
        <Tabs value={s.activeTab} onValueChange={s.setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="tasks" className="data-[state=active]:border-2 border-orange-500">
              <Shield className="w-4 h-4 mr-1" />
              My Tasks
            </TabsTrigger>

            <TabsTrigger value="schedule" className="data-[state=active]:border-2 border-orange-500">
              <Calendar className="w-4 h-4 mr-1" />
              Approved Schedule
            </TabsTrigger>

            <TabsTrigger value="inspection" className="data-[state=active]:border-2 border-orange-500">
              <FileText className="w-4 h-4 mr-1" />
              Room Inspection
            </TabsTrigger>
          </TabsList>

          {/* TAB: My Tasks */}
          <TabsContent value="tasks" className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Tasks" value={s.tasks.length} />
              <StatCard title="Pending" value={s.tasks.filter(t => t.status === "Pending").length} />
              <StatCard title="Completed" value={s.tasks.filter(t => t.status === "Completed").length} color="green" />
            </div>

            {/* Tasks Table */}
            <Card>
              <CardHeader>
                <CardTitle>Security Tasks</CardTitle>
                <CardDescription>View and complete assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {s.loading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : s.tasks.length === 0 ? (
                  <div className="text-center py-8">No tasks assigned</div>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Room</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {s.tasks.map(task => (
                        <TableRow key={task.id}>
                          <TableCell>{task.type}</TableCell>
                          <TableCell>{task.roomName}</TableCell>
                          <TableCell>{task.date} ({task.startTime} - {task.endTime})</TableCell>
                          <TableCell>
                            <Badge className={task.status === "Pending" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}>
                              {task.status}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            {task.status === "Pending" && (
                              <Button size="sm" onClick={() => {
                                s.setSelectedTask(task);
                                s.setCompleteTaskDialogOpen(true);
                              }}>
                                Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Approved Schedule */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Approved Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminScheduleView />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Inspection */}
          <TabsContent value="inspection">
            <InspectionTabUI s={s} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Task Dialog */}
      <CompleteTaskDialog s={s} />

      <Footer />
    </div>
  );
}

/* --- Helper Subcomponents (UI only) --- */

function StatCard({ title, value, color = "black" }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
      <CardContent><div className={`text-2xl text-${color}-600`}>{value}</div></CardContent>
    </Card>
  );
}

function InspectionTabUI({ s }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Room Inspection</CardTitle>
            <CardDescription>View room details and submit reports</CardDescription>
          </div>
          <Button 
            onClick={s.handleOpenReportDialog}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <FileText className="w-4 h-4 mr-2" />
            Submit Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {s.loading ? (
          <div className="text-center py-8">Loading rooms...</div>
        ) : s.rooms.length === 0 ? (
          <div className="text-center py-8">No rooms available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {s.rooms.map(room => {
              // Lấy images từ local data thay vì từ API
              const roomImages = getRoomImages(room.id);
              
              return (
                <Card key={room.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    {/* Room Images - Lấy từ local asset */}
                    {roomImages.length > 0 && (
                      <RoomImageGallery 
                        images={roomImages} 
                        roomName={room.name}
                        compact={true}
                      />
                    )}
                    
                    <div>
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-sm text-gray-600">{room.category}</p>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p className="text-gray-600">
                        {room.campus === "FU_FPT" ? "FU FPT" : "NVH"} - {room.building}, Floor {room.floor}
                      </p>
                      <p className="text-gray-600">Capacity: {room.capacity} people</p>
                      <p className="text-gray-600">Amenities: {room.amenities.join(", ")}</p>
                    </div>
                    
                    <Badge className={
                      room.status === "Active" ? "bg-green-100 text-green-700" :
                      room.status === "Maintenance" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }>
                      {room.status}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Submit Report Dialog */}
      <Dialog open={s.submitReportDialogOpen} onOpenChange={s.setSubmitReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Inspection Report</DialogTitle>
            <DialogDescription>Report an issue or maintenance request</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Room</Label>
              <Select value={s.selectedRoomId} onValueChange={s.setSelectedRoomId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a room..." />
                </SelectTrigger>
                <SelectContent>
                  {s.rooms.map(room => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} - {room.building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={s.reportType} onValueChange={s.setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleanliness">Cleanliness</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={s.reportSeverity} onValueChange={s.setReportSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={s.reportDescription}
                onChange={(e) => s.setReportDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => s.setSubmitReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={s.handleSubmitReport} className="bg-orange-500 hover:bg-orange-600">
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function CompleteTaskDialog({ s }) {
  return (
    <Dialog open={s.completeTaskDialogOpen} onOpenChange={s.setCompleteTaskDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Task</DialogTitle>
          <DialogDescription>
            Mark task as completed and add notes
          </DialogDescription>
        </DialogHeader>

        {s.selectedTask && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div>
                <span className="text-sm text-gray-600">Task Type:</span>
                <p className="font-medium">{s.selectedTask.type}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Room:</span>
                <p className="font-medium">{s.selectedTask.roomName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Date & Time:</span>
                <p className="font-medium">
                  {s.selectedTask.date} ({s.selectedTask.startTime} - {s.selectedTask.endTime})
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Completion Notes</Label>
              <Textarea
                placeholder="Add any relevant notes about task completion..."
                value={s.completionNotes}
                onChange={(e) => s.setCompletionNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => s.setCompleteTaskDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={s.handleCompleteTask} className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}