import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  staffApi,
  bookingsApi,
  roomsApi,
  Booking,
  Room,
  SecurityTask,
  Report,
  securityTasksApi,
} from "../../api/api";
import { BookingForSecurityTask } from "../../api/services/securityTasksApi";

export function useStaffDashboard() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [securityTasks, setSecurityTasks] = useState<SecurityTask[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog states
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [taskType, setTaskType] = useState<SecurityTask["type"]>("unlock_room");
  const [taskDate, setTaskDate] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("");
  const [taskEndTime, setTaskEndTime] = useState("");

  // Report Review dialog
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportResponse, setReportResponse] = useState("");
  const [reportStatus, setReportStatus] = useState<Report["status"]>("Reviewed");

  //TASK SECURITY

  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskDescription, setNewTaskDescription] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("Normal");
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState<string>("");

  // ========================= LOADERS ========================= //
  useEffect(() => {
    if (activeTab === "approvals") loadPendingBookings();
    else if (activeTab === "history") loadBookingHistory();
    else if (activeTab === "rooms") loadRooms();
    else if (activeTab === "security") loadSecurityTasks();
    else if (activeTab === "reports") loadReports();
  }, [activeTab]);

  const loadPendingBookings = async () => {
    setLoading(true);
    const data = await staffApi.getPendingBookings();
    setPendingBookings(data);
    setLoading(false);
  };

  const loadBookingHistory = async () => {
    setLoading(true);
    const data = await staffApi.getBookingHistory();
    setBookingHistory(data);
    setLoading(false);
  };

  const loadRooms = async () => {
    setLoading(true);
    const data = await roomsApi.getAll();
    setRooms(data);
    setLoading(false);
  };

  const loadSecurityTasks = async () => {
    setLoading(true);
    const data = await staffApi.getSecurityTasks();
    setSecurityTasks(data);
    setLoading(false);
  };

  const loadReports = async () => {
    setLoading(true);
    const data = await staffApi.getReports();
    setReports(data);
    setLoading(false);
  };

  // ========================= ACTION HANDLERS ========================= //

  const normalizeBookingId = (rawId: string | number): number =>
    typeof rawId === "string" ? parseInt(rawId, 10) : rawId;

  const handleApproveBooking = async (id: string | number, booking: Booking) => {
    const numericId = normalizeBookingId(id);
    if (Number.isNaN(numericId)) {
      toast.error("Invalid booking identifier");
      return;
    }

    const result = await bookingsApi.updateStatus(numericId, { status: "Approved" });
    if (result.success) {
      toast.success(result.message || "Booking approved successfully");
      loadPendingBookings();

      const bookingContext = booking;
      console.log("Booking context for security task assignment:", bookingContext);
        if (!bookingContext) {
          console.warn('Unable to find booking for security task assignment');
          return;
        }
      const autoAssignResult = await securityTasksApi.autoAssignForBooking();
      if (autoAssignResult.error) {
        toast.error(`Security task auto-assignment failed: ${autoAssignResult.error}`);
      }
      else {
        const success = await securityTasksApi.createSecurityTask({
            title: `Security Task for Booking #${numericId}`,
            description: `Auto-assigned open room security task for approved booking #${numericId}`,
            priority: undefined,
            assignedToId: autoAssignResult.assignedTo?.id ?? 0
        })
        if (success) {
          toast.success(autoAssignResult.success);
        }
      }
          
    } else toast.error(result.error || "Failed to approve booking");
  };

  const handleRejectBooking = async (id: string | number) => {
    const numericId = normalizeBookingId(id);
    if (Number.isNaN(numericId)) {
      toast.error("Invalid booking identifier");
      return;
    }

    const result = await bookingsApi.updateStatus(numericId, { status: "Rejected" });
    result.success
      ? toast.success(result.message || "Booking rejected")
      : toast.error(result.error || "Failed to reject");
    loadPendingBookings();
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    const success = await staffApi.cancelBooking(
      selectedBooking.id,
      cancelReason,
    );

    if (success) {
      toast.success("Booking cancelled");
      setCancelDialogOpen(false);
      setCancelReason("");
      setSelectedBooking(null);
      loadBookingHistory();
    } else toast.error("Failed to cancel booking");
  };

const handleCreateSecurityTask = async (newTaskTitle: string, newTaskDescription: string, newTaskPriority: string, newTaskAssignedTo: string) => {
    console.log('Creating security task with:', { newTaskTitle, newTaskDescription, newTaskPriority, newTaskAssignedTo });
    if (!newTaskTitle || !newTaskDescription || !newTaskAssignedTo) {
      toast.error("Please fill all required fields (Title, Description, Assignee)");
      return;
    }

    const assignedId = parseInt(newTaskAssignedTo);
    
    if (isNaN(assignedId)) {
        toast.error("Invalid staff member selected");
        return;
    }

    // 3. Call the API
    const success = await securityTasksApi.createSecurityTask({
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority || "Normal", // Default to Normal if undefined
      assignedToId: assignedId,
    });

    // 4. Handle success/failure
    if (success) {
      toast.success("Security task created successfully");
      loadSecurityTasks();
      setCreateTaskDialogOpen(false);
      
      // Optional: Reset form fields
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskPriority("Normal");
      setNewTaskAssignedTo("");
      
      // Optional: Refresh your task list here
      // fetchSecurityTasks(); 
    } else {
      toast.error("Failed to create task");
    }
  };

  const handleReviewReport = async () => {
    if (!selectedReport) return;
    const success = await staffApi.updateReportStatus(
      selectedReport.id,
      reportStatus,
      reportResponse
    );

    if (success) {
      toast.success("Report reviewed");
      setReportDialogOpen(false);
      setSelectedReport(null);
      setReportResponse("");
      loadReports();
    } else toast.error("Failed to review report");
  };

  // ========================= EXPORT HOOK ========================= //
  return {
    activeTab,
    setActiveTab,
    pendingBookings,
    bookingHistory,
    rooms,
    securityTasks,
    reports,
    loading,

    // dialogs
    selectedBooking,
    setSelectedBooking,
    cancelDialogOpen,
    setCancelDialogOpen,
    cancelReason,
    setCancelReason,

    createTaskDialogOpen,
    setCreateTaskDialogOpen,
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

    selectedReport,
    setSelectedReport,
    reportDialogOpen,
    setReportDialogOpen,
    reportResponse,
    setReportResponse,
    reportStatus,
    setReportStatus,

    // new security task fields
    newTaskTitle,
    setNewTaskTitle,
    newTaskDescription,
    setNewTaskDescription,
    newTaskPriority,
    setNewTaskPriority,
    newTaskAssignedTo,
    setNewTaskAssignedTo,

    // handlers
    handleApproveBooking,
    handleRejectBooking,
    handleCancelBooking,
    handleCreateSecurityTask,
    handleReviewReport,
  };
}
