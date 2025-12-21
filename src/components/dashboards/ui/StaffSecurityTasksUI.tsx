import { useEffect, useState } from "react"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Input } from "../../ui/input";
import { Plus } from "lucide-react";
import { SecurityTask, UserResponse, UserFilterRequest } from "../../../api/api";
import usersController from "../../../api/api/controllers/usersController";

interface StaffSecurityTasksUIProps {
  securityTasks: SecurityTask[];
  loading: boolean;
  createTaskDialogOpen: boolean;
  setCreateTaskDialogOpen: (open: boolean) => void;
  
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  
  newTaskDescription: string;
  setNewTaskDescription: (value: string) => void;
  
  newTaskPriority: string;
  setNewTaskPriority: (value: string) => void;
  
  newTaskAssignedTo: string; 
  setNewTaskAssignedTo: (value: string) => void;
  
  staffMembers?: UserResponse[]; // Made optional
  
  handleCreateSecurityTask: (newTaskTitle: string, newTaskDescription: string, newTaskPriority: string, newTaskAssignedTo: string) => void;
}

export function StaffSecurityTasksUI({
  securityTasks,
  loading,
  createTaskDialogOpen,
  setCreateTaskDialogOpen,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDescription,
  setNewTaskDescription,
  newTaskPriority,
  setNewTaskPriority,
  newTaskAssignedTo,
  setNewTaskAssignedTo,
  staffMembers = [], 
  handleCreateSecurityTask,
}: StaffSecurityTasksUIProps) {
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Pending" | "Completed">("ALL");
  const filteredTasks =
  statusFilter === "ALL"
    ? securityTasks
    : securityTasks.filter((task) => task.status === statusFilter);

  const [internalStaffMembers, setInternalStaffMembers] = useState<UserResponse[]>(staffMembers);

    const getPriorityBadge = (priority: string) => {
      switch (priority) {
        case "High": return <Badge className="w-100 bg-red-500">High</Badge>;
        case "Normal": return <Badge className="w-100 bg-blue-500">Normal</Badge>;
        default: return <Badge className="w-100 bg-slate-500">{priority}</Badge>;
      }
    };

  const getStatusBadge = (status: string) => {
    return status === "Pending" ? <Badge className="bg-yellow-500">Pending</Badge> : <Badge className="bg-green-500">{status}</Badge>;
  };

  useEffect(() => {
    const loadStaff = async () => {
      if (internalStaffMembers.length > 0) return;

      try {
        const filters: UserFilterRequest = { roleId: 6, pageIndex: 1, pageSize: 1000 };
        const result = await usersController.getUsers(filters);
        if (result?.items) {
          setInternalStaffMembers(result.items);
        }
      } catch (error) {
        console.error('Failed to load security staff list:', error);
      }
    };

    if (createTaskDialogOpen) {
      loadStaff();
    }
  }, [createTaskDialogOpen, internalStaffMembers.length]); 


  return (
    <>
      <Card>
<CardHeader>
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <CardTitle>Security Tasks</CardTitle>
      <CardDescription>
        Manage security and maintenance tasks
      </CardDescription>
    </div>

    {/* FILTER STATUS */}
    <div className="flex items-center gap-2">
      <Label className="text-sm text-gray-600">Status</Label>
      <Select
        value={statusFilter}
        onValueChange={(val) =>
          setStatusFilter(val as "ALL" | "Pending" | "Completed")
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <Button
      onClick={() => setCreateTaskDialogOpen(true)}
      className="bg-orange-500 hover:bg-orange-600"
    >
      <Plus className="h-4 w-4 mr-2" />
      Create Task
    </Button>
  </div>
</CardHeader>


        <CardContent className="space-y-4">
           {filteredTasks.map((task) => (
              <Card key={task.taskId} className="mb-4">
                <CardContent className="pt-6">
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-bold">{task.title}</h3>
                            <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                        <div className="flex gap-2">
                             {getPriorityBadge(task.priority)}
                             {getStatusBadge(task.status)}
                        </div>
                    </div>
                </CardContent>
              </Card>
           ))}
        </CardContent>
      </Card>

      <Dialog open={createTaskDialogOpen} onOpenChange={setCreateTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Security Task</DialogTitle>
            <DialogDescription>Create a new task for security personnel.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                placeholder="e.g., Check Fire Alarm" 
                value={newTaskTitle} 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                placeholder="Details about the task..." 
                value={newTaskDescription} 
                onChange={(e) => setNewTaskDescription(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Assign To</Label>
              <Select value={newTaskAssignedTo} onValueChange={setNewTaskAssignedTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a staff member" />
                </SelectTrigger>
                <SelectContent>
                  {internalStaffMembers.length > 0 ? (
                    internalStaffMembers.map((staff) => (
                      <SelectItem key={staff.userId} value={staff.userId.toString()}>
                        {staff.fullName} (ID: {staff.userId})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">
                         Loading staff...
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTaskDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
                onClick={() => handleCreateSecurityTask(newTaskTitle, newTaskDescription, newTaskPriority, newTaskAssignedTo)} 
                className="bg-orange-500 hover:bg-orange-600">
              Create Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}