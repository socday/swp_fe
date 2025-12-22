import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { notificationsApi } from "../../api/api";
import type { FrontendNotification } from "../../api/apiAdapters";

interface NotificationBellProps {
  onNavigateToNotifications: () => void;
}

export function NotificationBell({ onNavigateToNotifications }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<FrontendNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationsApi.getAll();
      console.log('Loaded notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative" 
      onClick={onNavigateToNotifications}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </Badge>
      )}
    </Button>
  );
}
