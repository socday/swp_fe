import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Calendar, Clock, Shield, Plus } from "lucide-react";
import { SecurityTask, Room } from "../../../lib/api";

interface StaffSecurityTasksUIProps {
  securityTasks: SecurityTask[];
  loading: boolean;
  createTaskDialogOpen: boolean;
  setCreateTaskDialogOpen: (open: boolean) => void;
  rooms: Room[];
  selectedRoom: string;
  setSelectedRoom: (roomId: string) => void;
  taskType: SecurityTask["type"];
  setTaskType: (type: SecurityTask["type"]) => void;
  taskDate: string;
  setTaskDate: (date: string) => void;
  taskStartTime: string;
  setTaskStartTime: (time: string) => void;
  taskEndTime: string;
  setTaskEndTime: (time: string) => void;
  handleCreateSecurityTask: () => void;
}

export function StaffSecurityTasksUI({
  securityTasks,
  loading,
  createTaskDialogOpen,
  setCreateTaskDialogOpen,
  rooms,
  selectedRoom,
  setSelectedRoom,
  taskType,
  setTaskType,
  taskDate,
  setTaskDate,
  taskStartTime,
  setTaskStartTime,
  taskEndTime,
  setTaskEndTime,
  handleCreateSecurityTask,
}: StaffSecurityTasksUIProps) {
  const getTaskTypeBadge = (type: SecurityTask["type"]) => {
    switch (type) {
      case "unlock_room":
        return <Badge className="bg-blue-500">Unlock Room</Badge>;
      case "lock_room":
        return <Badge className="bg-purple-500">Lock Room</Badge>;
      case "inspection":
        return <Badge className="bg-orange-500">Inspection</Badge>;
      case "maintenance":
        return <Badge className="bg-green-500">Maintenance</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: SecurityTask["status"]) => {
    switch (status) {
      case "Pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "Completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <p>Loading security tasks...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Security Tasks</CardTitle>
              <CardDescription>Manage security and maintenance tasks</CardDescription>
            </div>
            <Button onClick={() => setCreateTaskDialogOpen(true)} className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {securityTasks.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No security tasks</p>
          ) : (
            securityTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-gray-600" />
                          <h3 className="text-lg">{task.roomName}</h3>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {getTaskTypeBadge(task.type)}
                        {getStatusBadge(task.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(task.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {task.startTime} - {task.endTime}
                        </span>
                      </div>
                    </div>

                    {task.bookingId && task.bookingId !== "manual" && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm text-blue-700">
                          Linked to Booking ID: {task.bookingId}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Security Task</DialogTitle>
            <DialogDescription>Schedule a new security or maintenance task</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Room</Label>
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.name} - {room.building}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={(val) => setTaskType(val as SecurityTask["type"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlock_room">Unlock Room</SelectItem>
                  <SelectItem value="lock_room">Lock Room</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={taskDate} onChange={(e) => setTaskDate(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input type="time" value={taskStartTime} onChange={(e) => setTaskStartTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input type="time" value={taskEndTime} onChange={(e) => setTaskEndTime(e.target.value)} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSecurityTask} className="bg-orange-500 hover:bg-orange-600">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
