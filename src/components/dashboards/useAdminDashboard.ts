import { useState } from "react";
import { User } from "../../App";

export function useAdminDashboard(user: User, onLogout: () => void) {
  const [activeTab, setActiveTab] = useState("approvals");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return {
    activeTab,
    handleTabChange,
    user,
    onLogout,
  };
}
