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
} from "../../api/api";

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

  const handleApproveBooking = async (id: string | number) => {
    const numericId = normalizeBookingId(id);
    if (Number.isNaN(numericId)) {
      toast.error("Invalid booking identifier");
      return;
    }

    const result = await bookingsApi.updateStatus(numericId, { status: "Approved" });
    if (result.success) {
      toast.success(result.message || "Booking approved successfully");
      loadPendingBookings();

      const booking = pendingBookings.find((b) => b.id === numericId);
      if (booking) {
        await staffApi.createSecurityTask({
          bookingId: numericId,
          roomName: booking.roomName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          type: "unlock_room",
        });
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
      true
    );

    if (success) {
      toast.success("Booking cancelled");
      setCancelDialogOpen(false);
      setCancelReason("");
      setSelectedBooking(null);
      loadBookingHistory();
    } else toast.error("Failed to cancel booking");
  };

  const handleCreateSecurityTask = async () => {
    if (!selectedRoom || !taskDate || !taskStartTime || !taskEndTime) {
      toast.error("Please fill all fields");
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoom);
    if (!room) return;

    const success = await staffApi.createSecurityTask({
      bookingId: "manual",
      roomName: room.name,
      date: taskDate,
      startTime: taskStartTime,
      endTime: taskEndTime,
      type: taskType,
    });

    if (success) {
      toast.success("Security task created");
      setCreateTaskDialogOpen(false);
      setSelectedRoom("");
      setTaskDate("");
      setTaskStartTime("");
      setTaskEndTime("");
      loadSecurityTasks();
    } else toast.error("Failed to create task");
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

    // handlers
    handleApproveBooking,
    handleRejectBooking,
    handleCancelBooking,
    handleCreateSecurityTask,
    handleReviewReport,
  };
}
