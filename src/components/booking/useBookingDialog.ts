import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { bookingsApi } from "../../api/api";
import { User } from "../../App";
import { TimeSlot, fetchTimeSlots, getCachedTimeSlots } from "../../api/timeSlots";
import { Room } from "../../api/api";

export function useBookingDialog(
  room: Room,
  onSuccess?: () => void,
  onClose?: () => void,
  userRole?: "student" | "lecturer" | "admin"
) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [allSlots, setAllSlots] = useState<TimeSlot[]>(getCachedTimeSlots());

  // Semester booking states
  const [bookingType, setBookingType] = useState<"single" | "semester">("single");
  const [semesterStart, setSemesterStart] = useState<Date | undefined>(new Date());
  const [semesterEnd, setSemesterEnd] = useState<Date | undefined>();
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  // Calculate semester end date (3 months from start)
  useEffect(() => {
    if (semesterStart) {
      const endDate = new Date(semesterStart);
      endDate.setMonth(endDate.getMonth() + 3);
      setSemesterEnd(endDate);
    }
  }, [semesterStart]);

  useEffect(() => {
    let isMounted = true;

    fetchTimeSlots()
      .then((slots) => {
        if (isMounted) {
          setAllSlots(slots);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllSlots(getCachedTimeSlots());
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getCurrentUser = (): User | null => {
    const s = localStorage.getItem("currentUser");
    return s ? JSON.parse(s) : null;
  };

  const handleSlotToggle = (slot: TimeSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.id === slot.id);
      return exists
        ? prev.filter((s) => s.id !== slot.id)
        : [...prev, slot].sort((a, b) => a.id - b.id);
    });
  };

  const handleRemoveSlot = (slotId: number) => {
    setSelectedSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleDayToggle = (dayId: number) => {
    setSelectedDays((prev) => {
      const exists = prev.includes(dayId);
      return exists ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort();
    });
  };

  const resetForm = () => {
    setDate(new Date());
    setSelectedSlots([]);
    setPurpose("");
    setBookingType("single");
    setSemesterStart(new Date());
    setSelectedDays([]);
  };

  const normaliseRoomId = (roomId: string) => {
    if (/^\d+$/.test(roomId)) {
      return parseInt(roomId, 10);
    }

    const digits = roomId.match(/\d+/);
    return digits ? parseInt(digits[0], 10) : NaN;
  };

  const toIsoDate = (value: Date) => value.toISOString().split("T")[0];

  const isToday = (value?: Date) => {
    if (!value) return false;
    const today = new Date();
    return (
      value.getFullYear() === today.getFullYear() &&
      value.getMonth() === today.getMonth() &&
      value.getDate() === today.getDate()
    );
  };

  const getCurrentTimeString = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const availableSlots = useMemo(() => {
    if (bookingType === "single" && date && isToday(date)) {
      const currentTime = getCurrentTimeString();
      return allSlots.filter((slot) => slot.startTime > currentTime);
    }
    return allSlots;
  }, [allSlots, bookingType, date]);

  useEffect(() => {
    if (bookingType === "single" && date && isToday(date)) {
      const visibleIds = new Set(availableSlots.map((slot) => slot.id));
      setSelectedSlots((prev) => prev.filter((slot) => visibleIds.has(slot.id)));
    }
  }, [availableSlots, bookingType, date]);

  const submitSingleBookings = async (facilityId: number) => {
    const targetDate = toIsoDate(date!);

    const responses = await Promise.all(
      selectedSlots.map((slot) =>
        bookingsApi
          .create({
            facilityId,
            date: targetDate,
            slotId: slot.id,
            purpose,
          })
          .catch((error) => {
            console.error("create booking failed", error);
            return { success: false, error: (error as Error).message };
          })
      )
    );

    const successes = responses.filter((result) => result?.success);

    if (successes.length === selectedSlots.length) {
      toast.success(`${successes.length} booking request(s) submitted successfully!`);
      resetForm();
      onSuccess?.();
      onClose?.();
    } else {
      toast.error(
        `${successes.length} of ${selectedSlots.length} bookings submitted. Please review failed slots.`
      );
      const failedSlots = selectedSlots.filter((_, index) => !responses[index]?.success);
      setSelectedSlots(failedSlots);
    }
  };

  const submitSemesterBookings = async (facilityId: number) => {
    const startDate = toIsoDate(semesterStart!);
    const endDate = toIsoDate(semesterEnd!);
    const normalizedDays = selectedDays.map((d) => (d === 0 ? 7 : d));

    const responses = await Promise.all(
      selectedSlots.map((slot) =>
        bookingsApi
          .createRecurring({
            facilityId,
            slotId: slot.id,
            purpose: `[SEMESTER] ${purpose}`,
            startDate,
            endDate,
            daysOfWeek: normalizedDays,
          })
          .then(() => ({ success: true }))
          .catch((error) => {
            console.error("create recurring booking failed", error);
            return { success: false };
          })
      )
    );

    const successes = responses.filter((result) => result?.success);

    if (successes.length === selectedSlots.length) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const daysStr = selectedDays
        .map((day) => dayNames[day] ?? `Day ${day}`)
        .join(", ");
      toast.success(
        `Semester booking created! ${successes.length} booking set(s) scheduled for ${daysStr}.`
      );
      resetForm();
      onSuccess?.();
      onClose?.();
    } else {
      toast.error("Some semester bookings could not be created. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!getCurrentUser()) {
      toast.error("Please log in to make a booking");
      return;
    }

    if (bookingType === "single") {
      if (!date || selectedSlots.length === 0 || !purpose) {
        toast.error("Please fill in all fields and select at least one time slot");
        return;
      }
    } else if (!semesterStart || !semesterEnd || selectedSlots.length === 0 || selectedDays.length === 0 || !purpose) {
      toast.error("Please fill in all fields, pick recurring days, and select time slots");
      return;
    }

    const facilityId = normaliseRoomId(room.id);
    if (!facilityId || Number.isNaN(facilityId)) {
      toast.error("Unable to determine facility ID for this room");
      return;
    }

    setSubmitting(true);

    try {
      if (bookingType === "single") {
        await submitSingleBookings(facilityId);
      } else {
        await submitSemesterBookings(facilityId);
      }
    } catch (error) {
      console.error("Booking submission failed", error);
      toast.error("Failed to submit booking requests");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    date,
    setDate,
    selectedSlots,
    handleSlotToggle,
    handleRemoveSlot,
    purpose,
    setPurpose,
    submitting,
    handleSubmit,
    bookingType,
    setBookingType,
    semesterStart,
    setSemesterStart,
    semesterEnd,
    setSemesterEnd,
    selectedDays,
    handleDayToggle,
    availableSlots,
  };
}
