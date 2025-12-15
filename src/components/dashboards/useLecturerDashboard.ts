import { useState } from "react";
import { User } from "../../App";

export function useLecturerDashboard(user: User, onLogout: () => void) {
  const [activeTab, setActiveTab] = useState("search");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return {
    user,
    onLogout,
    activeTab,
    handleTabChange,
  };
}
