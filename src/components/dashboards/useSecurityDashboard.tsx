import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  securityApi,
  roomsApi,
  Booking,
  Room,
  SecurityTask,
  Report,
  ReportCreateRequest,
} from "../../api/api";
import { User } from "../../App";
import type { FrontendBooking, FrontendReport } from "../../api/apiAdapters";
import { reportsApi } from "../../api/services/reportsApi";

export function useSecurityDashboard(user: User) {
  // UI tab state
  const [activeTab, setActiveTab] = useState("tasks");

  // Data
  const [tasks, setTasks] = useState<SecurityTask[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<FrontendBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Task Completion Dialog state
  const [selectedTask, setSelectedTask] = useState<SecurityTask | null>(null);
  const [completeTaskDialogOpen, setCompleteTaskDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");

  // Report Submit Dialog state
  const [selectedTimeStart, setSelectedTimeStart] = useState<string>("");
  const [submitReportDialogOpen, setSubmitReportDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [reportType, setReportType] = useState<Report["type"]>("maintenance");
  const [reportSeverity, setReportSeverity] =
    useState<Report["severity"]>("Medium");
  const [reportDescription, setReportDescription] = useState("");
  const [reports, setReports] = useState<FrontendReport[]>([]);
  
const roomBookings = approvedBookings.filter(
  b => b.facilityId === Number(selectedRoomId)
);
const roomTimeSlots = roomBookings.map(b => ({
  value: `${b.date}|${b.startTime}|${b.endTime}`,
  label: `${b.date} · ${b.startTime} - ${b.endTime}`,
}));


useEffect(() => {
  setSelectedTimeStart("");
}, [selectedRoomId]);

  const loadReports = async () => {
  setLoading(true);
  setReports(await reportsApi.getAll());
  setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "tasks") loadTasks();
    if (activeTab === "schedule") loadApprovedBookings();
    if (activeTab === "inspection") loadRooms();
    if (activeTab === "reports") loadReports();  
  }, [activeTab]);

  const loadTasks = async () => {
    setLoading(true);
    setTasks(await securityApi.getTasks());
    setLoading(false);
  };

  const loadApprovedBookings = async () => {
  setLoading(true);
  const data = await securityApi.getApprovedBookings();
  console.log('Approved bookings:', data);
  setApprovedBookings(data);  
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
      selectedTask.taskId, 
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

const payload: ReportCreateRequest = {
  facilityId: Number(selectedRoomId),
  title: reportType,
  description: `${reportDescription}\nTime: ${selectedTimeStart}`,
  reportType,
};

  const success = await securityApi.submitReport(payload);

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
    setLoading(true);
    await Promise.all([
      loadRooms(),
      loadApprovedBookings(), 
    ]);
    setLoading(false);
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

    roomBookings,
    selectedTimeStart,
    setSelectedTimeStart,
    roomTimeSlots,

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

    reports,

    // Functions
    loadTasks,
    loadRooms,
    loadApprovedBookings,
    handleOpenReportDialog,
    handleCompleteTask,
    handleSubmitReport,
    getTaskIcon,
    loadReports,
  };
}
