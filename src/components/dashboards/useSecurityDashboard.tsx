import { useState, useEffect, useMemo } from "react";
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
  const [showTodayTasksOnly, setShowTodayTasksOnly] = useState(false);

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
 
const roomIdToNameMap = rooms.reduce((acc, room) => {
  acc[room.id] = room.name;
  return acc;
}, {} as Record<number, string>);
  
const roomBookings = approvedBookings.filter(
  b => b.facilityName === roomIdToNameMap[Number(selectedRoomId)]
);

const roomTimeSlots = roomBookings.map(b => ({
  value: `${b.date}|${b.startTime}|${b.endTime}`,
  label: `${b.date} · ${b.startTime} - ${b.endTime}`,
}));

const bookingMap = useMemo(() => {
  const map: Record<number, FrontendBooking> = {};
  approvedBookings.forEach(b => {
    map[b.id] = b;
  });
  return map;
}, [approvedBookings]);


useEffect(() => {
  setSelectedTimeStart("");
}, [selectedRoomId]);

  const loadReports = async () => {
  setLoading(true);
  setReports(await reportsApi.getAll());
  setLoading(false);
  console.log('Reports loaded:', reports);
  };

  useEffect(() => {
    if (activeTab === "tasks") loadTasks();
    if (activeTab === "schedule") loadApprovedBookings();
    if (activeTab === "inspection") loadRooms();
    if (activeTab === "reports") 
      loadReports(); 
    loadApprovedBookings();  
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
  if (!selectedRoomId || !selectedTimeStart || !reportDescription.trim()) {
    toast.error("Please fill all required fields");
    return;
  }

  const selectedBooking = approvedBookings.find(
    (b) =>
      b.facilityName === roomIdToNameMap[Number(selectedRoomId)] &&
      `${b.date}|${b.startTime}|${b.endTime}` === selectedTimeStart
  );

  if (!selectedBooking) {
    toast.error("No approved booking found for selected time");
    return;
  }

  const payload: ReportCreateRequest = {
    facilityId: Number(selectedRoomId),
    bookingId: selectedBooking.id, 
    title: reportType,
    reportType,
    description: `
${reportDescription}
`.trim(),
  };

  const success = await securityApi.submitReport(payload);

  if (success) {
    toast.success("Report submitted successfully");
    resetReportForm();
  } else {
    toast.error("Failed to submit report");
  }
};




  const resetReportForm = () => {
    setSubmitReportDialogOpen(false);
    setSelectedRoomId("");
    setSelectedTimeStart("");
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
    console.log('Rooms loaded:', rooms);
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

  // Filter tasks for today if needed
  const filteredTasks = showTodayTasksOnly
    ? tasks.filter(task => {
        // Filter tasks related to today's bookings
        if (!task.bookingId) return false;
        const taskBooking = bookingMap[task.bookingId];
        return taskBooking && taskBooking.date === today;
      })
    : tasks;

  const upcomingDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  return {
    // Data
    tasks: filteredTasks,
    approvedBookings,
    bookingsByDate,
    todayBookings,
    upcomingDates,
    rooms,
    loading,
    bookingMap,
    showTodayTasksOnly,
    setShowTodayTasksOnly,

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
