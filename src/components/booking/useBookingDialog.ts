import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { bookingsApi } from "../../api/api";
import { slotsApi } from "../../api/services/slotsApi";
import { bookingsController } from "../../api/api/controllers/bookingsController";
import type { User } from "../../App";
import type { TimeSlot } from "../../api/timeSlots";
import type { Room } from "../../api/api";
import type { RecurringConflictCheckResponse } from "../../api/api/types";

export type RecurrencePattern = 1 | 2 | 3 | 4 | 5 | 6 | 7; // Daily=1, Weekly=2, Weekdays=3, Weekends=4, Monthly=5, Custom=6

export function useBookingDialog(
  room: Room,
  initialDate?: string, // ISO date string like "2025-12-17"
  onSuccess?: () => void,
  onClose?: () => void,
  userRole?: "student" | "lecturer" | "admin" | "staff" | "security",
) {
  // Initialize date from initialDate string to avoid timezone issues
  const [date, setDate] = useState<Date | undefined>(() => {
    if (initialDate) {
      // Parse as local date to avoid timezone offset
      const [year, month, day] = initialDate.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  });
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [purpose, setPurpose] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Booking type states
  const [bookingType, setBookingType] = useState<"single" | "recurring">("single");
  
  // Recurring booking states
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>(2); // Default to Weekly
  const [selectedDays, setSelectedDays] = useState<number[]>([]); // 2-8 for Mon-Sun (Vietnamese format)
  const [interval, setInterval] = useState<number>(1);
  const [autoFindAlternative, setAutoFindAlternative] = useState<boolean>(true);
  const [skipConflicts, setSkipConflicts] = useState<boolean>(true);

  // Conflict checking states
  const [conflictCheckResult, setConflictCheckResult] = useState<RecurringConflictCheckResponse | null>(null);
  const [checkingConflicts, setCheckingConflicts] = useState<boolean>(false);

  // Fetch slots based on booking type
  useEffect(() => {
    let isMounted = true;

    const fetchSlots = async () => {
      setLoadingSlots(true);
      try {
        if (bookingType === "recurring") {
          const apiSlots = await slotsApi.getAll();
          console.log('Fetched all slots for recurring booking:', apiSlots);
          const timeSlots: TimeSlot[] = apiSlots.map(slot => ({
            id: slot.id,
            label: slot.name || `Slot ${slot.id}`,
            startTime: slot.startTime || '',
            endTime: slot.endTime || '',
            displayTime: slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : '',
          }));
          
          if (isMounted) {
            setAllSlots(timeSlots);
          }
        } else {
          const facilityId = normaliseRoomId(room.id);
          const dateStr = date ? toIsoDate(date) : undefined;
          
          if (facilityId && !Number.isNaN(facilityId) && dateStr) {
            const apiSlots = await slotsApi.getAvailable(facilityId, dateStr);
            console.log('Fetched available slots from API:', apiSlots);
            const timeSlots: TimeSlot[] = apiSlots.map(slot => ({
              id: slot.id,
              label: slot.name || `Slot ${slot.id}`,
              startTime: slot.startTime || '',
              endTime: slot.endTime || '',
              displayTime: slot.startTime && slot.endTime ? `${slot.startTime} - ${slot.endTime}` : '',
            }));
            
            if (isMounted) {
              setAllSlots(timeSlots);
            }
          } else {
            if (isMounted) {
              setAllSlots([]);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch slots:', error);
        if (isMounted) {
          setAllSlots([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSlots(false);
        }
      }
    };

    fetchSlots();
    return () => {
      isMounted = false;
    };
  }, [room.id, date, bookingType]);

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
    setStartDate(new Date());
    setEndDate(undefined);
    setSelectedDays([]);
    setRecurrencePattern(2);
    setInterval(1);
    setConflictCheckResult(null);
  };

  const normaliseRoomId = (roomId: string) => {
    if (/^\d+$/.test(roomId)) {
      return parseInt(roomId, 10);
    }

    const digits = roomId.match(/\d+/);
    return digits ? parseInt(digits[0], 10) : NaN;
  };

  const toIsoDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
    console.log('All slots for booking type', bookingType, ':', allSlots);
    return allSlots;
  }, [allSlots, bookingType, date]);

  useEffect(() => {
    if (bookingType === "single" && date && isToday(date)) {
      const visibleIds = new Set(availableSlots.map((slot) => slot.id));
      setSelectedSlots((prev) => prev.filter((slot) => visibleIds.has(slot.id)));
    }
  }, [availableSlots, bookingType, date]);

  // Convert standard day (0=Sun, 1=Mon) to Vietnamese format (2=Mon, 8=Sun)
  const convertToVietnameseDay = (standardDay: number): number => {
    return standardDay === 0 ? 8 : standardDay + 1;
  };

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
    const failedResponse = responses.find((result) => !result?.success);

    if (successes.length === selectedSlots.length && !failedResponse) {
      const successMessage = responses[0]?.message || `${successes.length} booking request(s) submitted successfully!`;
      toast.success(successMessage);
      resetForm();
      onSuccess?.();
      onClose?.();
    } else {
      const failureMessage = failedResponse?.error || `${successes.length} of ${selectedSlots.length} bookings submitted. Please review failed slots.`;
      toast.error(failureMessage);
      const failedSlots = selectedSlots.filter((_, index) => !responses[index]?.success);
      setSelectedSlots(failedSlots);
    }
  };

  const checkRecurringConflicts = async (facilityId: number, slotId: number): Promise<RecurringConflictCheckResponse | null> => {
    const startDateStr = toIsoDate(startDate!);
    const endDateStr = toIsoDate(endDate!);

    // Determine daysOfWeek based on recurrence pattern
    let daysOfWeek: number[] = [];
    if (recurrencePattern === 6) {
      daysOfWeek = selectedDays;
    } else if (recurrencePattern === 2) {
      const dayOfWeek = startDate!.getDay();
      daysOfWeek = [dayOfWeek === 0 ? 8 : dayOfWeek + 1];
    } else if (recurrencePattern === 3) {
      daysOfWeek = [2, 3, 4, 5, 6];
    } else if (recurrencePattern === 4) {
      daysOfWeek = [7, 8];
    }

    try {
      const result = await bookingsController.checkRecurringConflicts({
        facilityId,
        slotId,
        purpose,
        startDate: startDateStr,
        endDate: endDateStr,
        pattern: recurrencePattern,
        daysOfWeek,
        interval,
        autoFindAlternative,
        skipConflicts,
      });
      return result;
    } catch (error) {
      console.error("Failed to check conflicts:", error);
      toast.error("Failed to check conflicts. Please try again.");
      return null;
    }
  };

  const submitRecurringBookings = async (facilityId: number) => {
    const startDateStr = toIsoDate(startDate!);
    const endDateStr = toIsoDate(endDate!);

    // Determine daysOfWeek based on recurrence pattern
    let daysOfWeek: number[] = [];
    if (recurrencePattern === 6) {
      // Custom pattern - use selected days
      daysOfWeek = selectedDays;
    } else if (recurrencePattern === 2) {
      // Weekly pattern - use the day of week from start date
      const dayOfWeek = startDate!.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      daysOfWeek = [dayOfWeek === 0 ? 8 : dayOfWeek + 1]; // Convert to Vietnamese format (2-8)
    } else if (recurrencePattern === 3) {
      // Weekdays - Monday to Friday (2-6 in Vietnamese format)
      daysOfWeek = [2, 3, 4, 5, 6];
    } else if (recurrencePattern === 4) {
      // Weekends - Saturday and Sunday (7, 8 in Vietnamese format)
      daysOfWeek = [7, 8];
    }
    // For Daily (1) and Monthly (5), daysOfWeek can be empty array

    const responses = await Promise.all(
      selectedSlots.map((slot) =>
        bookingsApi
          .createRecurring({
            facilityId,
            slotId: slot.id,
            purpose,
            startDate: startDateStr,
            endDate: endDateStr,
            pattern: recurrencePattern,
            daysOfWeek,
            interval,
            autoFindAlternative,
            skipConflicts,
          })
          .then((result: any) => ({ success: true, message: result?.message }))
          .catch((error) => {
            console.error("create recurring booking failed", error);
            return { success: false, error: (error as Error).message };
          })
      )
    );

    const successes = responses.filter((result) => result?.success);
    const failedResponse = responses.find((result) => !result?.success);

    if (successes.length === selectedSlots.length && !failedResponse) {
      const successMessage = responses[0]?.message ||
        `Recurring booking created! ${successes.length} booking set(s) scheduled.`;
      toast.success(successMessage);
      resetForm();
      onSuccess?.();
      onClose?.();
    } else {
      const failureMessage = failedResponse?.error || "Some recurring bookings could not be created. Please try again.";
      toast.error(failureMessage);
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
    } else {
      if (!startDate || !endDate || selectedSlots.length === 0 || !purpose) {
        toast.error("Please fill in all fields and select time slots");
        return;
      }
      if (recurrencePattern === 6 && selectedDays.length === 0) {
        toast.error("Please select at least one day for custom recurring pattern");
        return;
      }
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
        // For recurring bookings, check conflicts first for the first slot
        setCheckingConflicts(true);
        const conflictResult = await checkRecurringConflicts(facilityId, selectedSlots[0].id);
        setCheckingConflicts(false);

        if (conflictResult) {
          setConflictCheckResult(conflictResult);
          
          // If there are blocked dates and we're not skipping conflicts, show the conflict info and stop
          if (conflictResult.blockedCount > 0 && !skipConflicts) {
            toast.warning("Please review conflicts before proceeding");
            setSubmitting(false);
            return;
          }

          // Show conflict summary even if we can proceed
          if (conflictResult.conflictCount > 0) {
            toast.info(conflictResult.message);
          }
        }

        await submitRecurringBookings(facilityId);
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
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    recurrencePattern,
    setRecurrencePattern,
    selectedDays,
    handleDayToggle,
    interval,
    setInterval,
    autoFindAlternative,
    setAutoFindAlternative,
    skipConflicts,
    setSkipConflicts,
    availableSlots,
    allSlots,
    convertToVietnameseDay,
    conflictCheckResult,
    checkingConflicts,
  };
}
