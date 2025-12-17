import { useState, useEffect } from "react";
import { toast } from "sonner";
import { reportsApi } from "../../api/services/reportsApi";
import type { FrontendReport } from "../../api/apiAdapters";

export function useStudentDashboard() {
  // ===== TAB =====
  const [activeTab, setActiveTab] = useState("search");

  // ===== REPORTS =====
  const [reports, setReports] = useState<FrontendReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [reportType, setReportType] = useState("Hỏng thiết bị");
  const [reportDescription, setReportDescription] = useState("");

  /* ===== LOAD REPORTS ===== */
  const loadReports = async () => {
    setLoadingReports(true);
    setReports(await reportsApi.getAll());
    setLoadingReports(false);
  };

  useEffect(() => {
    if (activeTab === "reports") {
      loadReports();
    }
  }, [activeTab]);

  /* ===== CREATE REPORT ===== */
  const handleCreateReport = async (facilityId: number) => {
    if (!reportDescription.trim()) {
      toast.error("Please enter a description.");
      return;
    }

    const result = await reportsApi.create({
      facilityId,
      title: "Student report",
      description: reportDescription,
      reportType,
    });

    if (result.success) {
      toast.success("Report sent successfully");
      setReportDescription("");
      loadReports();
    } else {
      toast.error("Failed to send report");
    }
  };

  return {
    // tabs
    activeTab,
    setActiveTab,

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
