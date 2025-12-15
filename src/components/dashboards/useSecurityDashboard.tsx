import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  securityApi,
  roomsApi,
  Booking,
  Room,
  SecurityTask,
  Report,
} from "../../api/api";
import { User } from "../../App";

export function useSecurityDashboard(user: User) {
  // UI tab state
  const [activeTab, setActiveTab] = useState("tasks");

  // Data
  const [tasks, setTasks] = useState<SecurityTask[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Task Completion Dialog state
  const [selectedTask, setSelectedTask] = useState<SecurityTask | null>(null);
  const [completeTaskDialogOpen, setCompleteTaskDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  // Report Submit Dialog state
  const [submitReportDialogOpen, setSubmitReportDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [reportType, setReportType] = useState<Report["type"]>("maintenance");
  const [reportSeverity, setReportSeverity] =
    useState<Report["severity"]>("Medium");
  const [reportDescription, setReportDescription] = useState("");

  useEffect(() => {
    if (activeTab === "tasks") loadTasks();
    if (activeTab === "schedule") loadApprovedBookings();
    if (activeTab === "inspection") loadRooms();
  }, [activeTab]);

  const loadTasks = async () => {
    setLoading(true);
    setTasks(await securityApi.getTasks());
    setLoading(false);
  };

  const loadApprovedBookings = async () => {
    setLoading(true);
    setApprovedBookings(await securityApi.getApprovedBookings());
    setLoading(false);
  };

  const loadRooms = async () => {
    setLoading(true);
    setRooms(await roomsApi.getAll());
    setLoading(false);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    const success = await securityApi.completeTask(
      selectedTask.id,
      completionNotes
    );

    if (success) {
      toast.success("Task marked as completed");
      setCompleteTaskDialogOpen(false);
      setSelectedTask(null);
      setCompletionNotes("");
      loadTasks();
    } else {
      toast.error("Failed to complete task");
    }
  };

  const handleSubmitReport = async () => {
    if (!selectedRoomId || !reportDescription.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return;

    const success = await securityApi.submitReport({
      roomId: selectedRoomId,
      roomName: room.name,
      reporterRole: "security",
      reporterName: user.name,
      reporterId: user.id,
      type: reportType,
      description: reportDescription,
      severity: reportSeverity,
    });

    if (success) {
      toast.success("Report submitted");
      resetReportForm();
    } else {
      toast.error("Failed to submit");
    }
  };

  const resetReportForm = () => {
    setSubmitReportDialogOpen(false);
    setSelectedRoomId("");
    setReportType("maintenance");
    setReportSeverity("Medium");
    setReportDescription("");
  };

  const handleOpenReportDialog = async () => {
    await loadRooms();
    setSubmitReportDialogOpen(true);
  };

  const getTaskIcon = () => <></>; // replaced by UI icons

  // Derived data
  const bookingsByDate = approvedBookings.reduce((acc, b) => {
    acc[b.date] ??= [];
    acc[b.date].push(b);
    return acc;
  }, {} as Record<string, Booking[]>);

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookingsByDate[today] || [];

  const upcomingDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  return {
    // Data
    tasks,
    approvedBookings,
    bookingsByDate,
    todayBookings,
    upcomingDates,
    rooms,
    loading,

    // UI States
    activeTab,
    setActiveTab,

    selectedTask,
    setSelectedTask,

    completeTaskDialogOpen,
    setCompleteTaskDialogOpen,

    completionNotes,
    setCompletionNotes,

    submitReportDialogOpen,
    setSubmitReportDialogOpen,

    selectedRoomId,
    setSelectedRoomId,

    reportType,
    setReportType,

    reportSeverity,
    setReportSeverity,

    reportDescription,
    setReportDescription,

    // Functions
    loadTasks,
    loadRooms,
    loadApprovedBookings,
    handleOpenReportDialog,
    handleCompleteTask,
    handleSubmitReport,
    getTaskIcon,
  };
}
