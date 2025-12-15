import { useState, useEffect } from "react";
import { bookingsApi, Booking } from "../../lib/api";
import { TIME_SLOTS } from "../../lib/timeSlots";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function useScheduleView(userId?: string) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);

    const data = await bookingsApi.getAll();

    // only approved
    setBookings(data.filter((b) => b.status === "Approved"));

    setLoading(false);
  };

  const getWeekDates = () => {
    const week: Date[] = [];
    const startOfWeek = new Date(currentDate);

    const day = currentDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    startOfWeek.setDate(currentDate.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push(date);
    }

    return week;
  };

  const weekDates = getWeekDates();

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

  const getBookingsForDateAndSlot = (date: Date, slotId: number) => {
    const key = formatDateKey(date);
    const slot = TIME_SLOTS.find((s) => s.id === slotId);

    if (!slot) return [];

    return bookings.filter((b) => {
      const matchesDate = b.date === key;
      const matchesSlot =
        b.startTime === slot.startTime && b.endTime === slot.endTime;

      const matchesCampus =
        selectedCampus === "all" || b.campus === selectedCampus;

      return matchesDate && matchesSlot && matchesCampus;
    });
  };

  const getEventColor = (booking: Booking) => {
    if (userId && booking.userId === userId) {
      return "bg-orange-100 border-orange-400 text-orange-900";
    }
    return "bg-blue-100 border-blue-400 text-blue-900";
  };

  return {
    daysOfWeek,
    currentDate,
    weekDates,
    selectedCampus,
    bookings,
    loading,

    setSelectedCampus,
    goToPreviousWeek,
    goToNextWeek,
    getBookingsForDateAndSlot,
    getEventColor,
    formatDateKey,
  };
}
