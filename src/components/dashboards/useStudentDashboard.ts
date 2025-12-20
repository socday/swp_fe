import { useState, useEffect } from "react";
import { toast } from "sonner";
import { reportsApi } from "../../api/services/reportsApi";
import type { FrontendBooking, FrontendReport } from "../../api/apiAdapters";
import { bookingsApi } from "../../api/services/bookingsApi";
import type { User } from "../../App";
import { useMemo } from "react";
import type { GetFacilityResponse } from "../../api/api";
import { facilitiesController } from "../../api/api/controllers/facilitiesController";

export function useStudentDashboard(user:User) {
  // ===== TAB =====
  const [activeTab, setActiveTab] = useState("search");

  // ===== REPORTS =====
  const [approvedBookings, setApprovedBookings] = useState<FrontendBooking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [reports, setReports] = useState<FrontendReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [reportType, setReportType] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [facilities, setFacilities] = useState<GetFacilityResponse[]>([]);
  /* ===== LOAD REPORTS ===== */
  const loadReports = async () => {
    setLoadingReports(true);
    setReports(await reportsApi.getAll());
    setLoadingReports(false);
  };
  const loadFacilities = async () => {
  const data = await facilitiesController.getFacilities();
  setFacilities(data);
};

useEffect(() => {
  if (activeTab === "reports") {
    loadApprovedBookings();
    loadMyReports();
    loadFacilities(); 
  }
}, [activeTab]);
  const facilityNameToIdMap = useMemo(() => {
  const map: Record<string, number> = {};

  facilities.forEach(f => {
    map[f.facilityName] = f.facilityId;
  });

  console.log("FACILITY MAP:", map);
  return map;
}, [facilities]);

const loadMyReports = async () => {
  setLoadingReports(true);

  const allReports = await reportsApi.getAll();

  const myReports = allReports
  .filter(r => r.createdBy === user.email)
  .sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  setReports(myReports);
  setLoadingReports(false);
};
const loadApprovedBookings = async () => {
  const bookings = await bookingsApi.getBookingIndividual(
    Number(user.id),
    "Approved"
  );
  setApprovedBookings(bookings);
  console.log("APPROVED BOOKINGS:", bookings);
};

useEffect(() => {
  if (activeTab === "reports") {
    loadApprovedBookings();
    loadMyReports();
  }
}, [activeTab]);

  /* ===== CREATE REPORT ===== */
const handleCreateReport = async () => {
  if (!selectedBookingId || !reportDescription.trim()) {
    toast.error("Please select booking and enter description");
    return;
  }

  const booking = approvedBookings.find(b => b.id === selectedBookingId);
  if (!booking) {
    toast.error("Booking not found");
    return;
  }

  const facilityId = facilityNameToIdMap[booking.facilityName as string];
  console.log("Mapped facility ID:", facilityId);
  if (!facilityId) {
    toast.error("Cannot map facility");
    console.error("Booking:", booking);
    console.error("Facility map:", facilityNameToIdMap);
    return;
  }

  const payload = {
    facilityId,
    bookingId: booking.id,
    title: "Student report",
    reportType: reportType || "Student report",
    description: reportDescription.trim(),
  };

  console.log("CREATE REPORT PAYLOAD (FINAL):", payload);

  const result = await reportsApi.create(payload);

  if (result.success) {
    toast.success("Report submitted");
    setSelectedBookingId(null);
    setReportDescription("");
    loadMyReports();
  } else {
    toast.error("Failed to submit report");
  }
};
  return {
    // tabs
    activeTab,
    setActiveTab,
    approvedBookings,
    setSelectedBookingId,
    selectedBookingId,
    // reports
    reports,
    loadingReports,
    reportType,
    setReportType,
    reportDescription,
    setReportDescription,
    handleCreateReport,
  };
}
