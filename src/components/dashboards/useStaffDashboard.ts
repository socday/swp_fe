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
import type { RecurringBookingSummary } from '../../api/api/types';
import { BookingForSecurityTask } from "../../api/services/securityTasksApi";

export function useStaffDashboard() {
  const [activeTab, setActiveTab] = useState("approvals");
  const [bookingType, setBookingType] = useState<"individual" | "recurring">("individual");
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [recurringGroups, setRecurringGroups] = useState<RecurringBookingSummary[]>([]);
  const [bookingHistory, setBookingHistory] = useState<Booking[]>([]);
  const [bookingHistoryPage, setBookingHistoryPage] = useState(1);
  const [bookingHistoryPageSize, setBookingHistoryPageSize] = useState(10);
  const [bookingHistoryTotalRecords, setBookingHistoryTotalRecords] = useState(0);
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
  }, [activeTab, bookingType]);

  const loadPendingBookings = async () => {
    setLoading(true);
    try {
      if (bookingType === "individual") {
        const data = await staffApi.getPendingBookings();
        setPendingBookings(data);
      } else {
        const groups = await bookingsApi.getBookingRecurrenceGroup();
        setRecurringGroups(groups);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const loadBookingHistory = async (page: number = bookingHistoryPage, pageSize: number = bookingHistoryPageSize) => {
    setLoading(true);
    const data = await staffApi.getBookingHistory(page, pageSize);
    setBookingHistory(data.bookings);
    setBookingHistoryTotalRecords(data.totalRecords);
    setBookingHistoryPage(data.pageIndex);
    setBookingHistoryPageSize(data.pageSize);
    setLoading(false);
    console.log("Loaded booking history:", data);
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
    console.log("Loaded security tasks:", data);
  };

const loadReports = async () => {
  setLoading(true);
  try {
    const [reportsData, bookingsData] = await Promise.all([
      staffApi.getReports(),
      staffApi.getBookingHistory(),
    ]);

    const bookingMap = new Map(
      bookingsData.map((b) => [Number(b.id), b])
    );

    const mergedReports = reportsData.map((r) => {
      const booking = bookingMap.get(Number(r.bookingId));

      return {
        ...r,
        id: r.reportId,
        roomName: r.facilityName,
        userName: booking?.userName ?? r.createdBy,
        startTime: booking?.startTime ?? null, 
      };
    });

    setReports(mergedReports);
  } catch (e) {
    toast.error("Failed to load reports");
  } finally {
    setLoading(false);
  }
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
      toast.success(result.message || "Booking approved successfully. Security task created automatically.");
      loadPendingBookings();
    } else {
      toast.error(result.error || "Failed to approve booking");
    }
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
      console.log("=== REVIEW REPORT CLICKED ===");
  console.log("Selected report:", selectedReport);
  console.log("Report ID being sent:", selectedReport.id);
  console.log("Report status:", reportStatus);
  console.log("Report response:", reportResponse);
    const success = await staffApi.updateReportStatus(
      selectedReport.id,
      reportStatus,
      reportResponse
    );
    console.log("Update report API result:", success);

    if (success) {
      toast.success("Report reviewed");
      setReportDialogOpen(false);
      setSelectedReport(null);
      setReportResponse("");
      loadReports();
      console.log("Report reviewed successfully");
    } else toast.error("Failed to review report");
  };

  const handleBookingHistoryPageChange = (newPage: number) => {
    setBookingHistoryPage(newPage);
    loadBookingHistory(newPage, bookingHistoryPageSize);
  };

  const handleBookingHistoryPageSizeChange = (newPageSize: number) => {
    setBookingHistoryPageSize(newPageSize);
    setBookingHistoryPage(1);
    loadBookingHistory(1, newPageSize);
  };

  // ========================= EXPORT HOOK ========================= //
  return {
    activeTab,
    setActiveTab,
    bookingType,
    setBookingType,
    pendingBookings,
    recurringGroups,
    bookingHistory,
    bookingHistoryPage,
    bookingHistoryPageSize,
    bookingHistoryTotalRecords,
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
    handleBookingHistoryPageChange,
    handleBookingHistoryPageSizeChange,
    onRecurringGroupActionComplete: loadPendingBookings,
  };
}
