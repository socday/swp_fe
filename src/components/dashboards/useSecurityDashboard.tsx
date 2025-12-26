import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  securityApi,
  roomsApi,
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
  const [taskFilter, setTaskFilter] = useState<"all" | "today">("all");
  const [tasks, setTasks] = useState<SecurityTask[]>([]);
  const [approvedBookings, setApprovedBookings] = useState<FrontendBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  // Task Completion Dialog state
  const [selectedTask, setSelectedTask] = useState<SecurityTask | null>(null);
  const [completeTaskDialogOpen, setCompleteTaskDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState("");
  const [checkInStatus, setCheckInStatus] = useState<string | null>(null);

  // Report Submit Dialog state
  const [selectedTimeStart, setSelectedTimeStart] = useState<string>("");
  const [submitReportDialogOpen, setSubmitReportDialogOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [reportType, setReportType] = useState<Report["type"]>("maintenance");
  const [reportSeverity, setReportSeverity] =
    useState<Report["severity"]>("Medium");
  const [reportDescription, setReportDescription] = useState("");
  const [reports, setReports] = useState<FrontendReport[]>([]);
  const formatVietnamDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    // Formats any date using Vietnam's timezone so "today" matches user expectations
    return (date: Date) => formatter.format(date);
  }, []);

  const today = formatVietnamDate(new Date());

  const getTaskVietnamDate = useCallback(
    (task?: SecurityTask | null) => {
      if (!task?.dueDate) return null;
      return formatVietnamDate(new Date(task.dueDate));
    },
    [formatVietnamDate]
  );
  const bookingMap = useMemo(() => {
  const map: Record<number, FrontendBooking> = {};
  approvedBookings.forEach(b => {
    map[b.id] = b;
  });
  return map;
}, [approvedBookings]);
const filteredTasks = useMemo(() => {
  if (taskFilter === "today") {
    console.log('Filtering tasks for today:', tasks);
    return tasks.filter(task => {

      const bookingDate = getTaskVietnamDate(task);
      console.log('Booking date for task:', task);
      return bookingDate === today;
    });
  }
  return tasks;
}, [tasks, bookingMap, taskFilter, today, getTaskVietnamDate]);

const roomIdToNameMap = rooms.reduce((acc, room) => {
  acc[room.id] = room.name;
  return acc;
}, {} as Record<number, string>);
  
const roomBookings = approvedBookings.filter(
  b => b.facilityName === roomIdToNameMap[Number(selectedRoomId)]
);

const roomTimeSlots =
 roomBookings.map(b => ({
  value: `${b.date}|${b.startTime}|${b.endTime}`,
  label: `${b.date} · ${b.startTime} - ${b.endTime}`,
}));


const openCompleteTaskDialog = (task: SecurityTask) => {
  setSelectedTask(task);
  setCheckInStatus(task.taskType ?? null);
  setCompleteTaskDialogOpen(true);
};


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
    if (activeTab === "reports") 
      loadReports(); 
    loadApprovedBookings();  
  }, [activeTab]);

  const loadTasks = async () => {
    setLoading(true);
    setTasks(await securityApi.getTasks());
    setLoading(false);
    console.log('Loaded tasks:', tasks);
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
      completionNotes,
    );

    if (success) {
    toast.success("Task updated");
    setCompleteTaskDialogOpen(false);
    setSelectedTask(null);
    setCompletionNotes("");
    setCheckInStatus(null);
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
  };


  const getTaskIcon = () => <></>; // replaced by UI icons

  // Derived data
  const bookingsByDate = useMemo(() => {
    return approvedBookings.reduce((acc, b) => {
      const normalizedDate = getTaskVietnamDate(b);
      if (!normalizedDate) {
        return acc;
      }
      acc[normalizedDate] ??= [];
      acc[normalizedDate].push(b);
      return acc;
    }, {} as Record<string, FrontendBooking[]>);
  }, [approvedBookings, getTaskVietnamDate]);

  const todayBookings = bookingsByDate[today] || [];

  const upcomingDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return formatVietnamDate(d);
    });
  }, [formatVietnamDate]);

  return {
      tasks,
  filteredTasks,
  taskFilter,
  setTaskFilter,
    // Data
    approvedBookings,
    bookingsByDate,
    todayBookings,
    upcomingDates,
    rooms,
    loading,
    bookingMap,

    roomBookings,
    selectedTimeStart,
    setSelectedTimeStart,
    roomTimeSlots,

    // UI States
    activeTab,
    setActiveTab,
    checkInStatus,
    setCheckInStatus,
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
    openCompleteTaskDialog,
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
