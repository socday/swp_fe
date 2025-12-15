import { useState } from "react";

export function useStudentDashboard() {
  const [activeTab, setActiveTab] = useState("search");

  return {
    activeTab,
    setActiveTab,
  };
}
