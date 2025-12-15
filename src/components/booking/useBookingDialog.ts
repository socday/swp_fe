import { useState, useEffect } from "react";
import { toast } from "sonner@2.0.3";
import { bookingsApi } from "../../api/api";
import { User } from "../../App";
import { TimeSlot } from "../../api/timeSlots";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) {
      toast.error("Please log in to make a booking");
      return;
    }

    // Validation based on booking type
    if (bookingType === "single") {
      if (!date || selectedSlots.length === 0 || !purpose) {
        toast.error("Please fill in all fields and select at least one time slot");
        return;
      }
    } else {
      // Semester booking validation
      if (!semesterStart || selectedSlots.length === 0 || selectedDays.length === 0 || !purpose) {
        toast.error("Please fill in all fields, select days of the week, and time slots");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (bookingType === "single") {
        // Single day booking - tạo booking cho từng time slot
        const bookingPromises = selectedSlots.map((slot) => {
          return bookingsApi.create({
            roomId: room.id,
            roomName: room.name,
            campus: room.campus,
            building: room.building,
            category: room.category,
            date: date!.toISOString().split("T")[0],
            startTime: slot.startTime,
            endTime: slot.endTime,
            purpose,
            userId: user.id,
            userName: user.name,
            userRole: user.role as "student" | "lecturer",
            isSemester: false,
          });
        });

        const results = await Promise.all(bookingPromises);
        const allSuccess = results.every((r) => r.success);
        const successCount = results.filter((r) => r.success).length;

        setSubmitting(false);

        if (allSuccess) {
          toast.success(`${successCount} booking request(s) submitted successfully!`);
          resetForm();
          onSuccess?.();
          onClose?.();
        } else {
          toast.error(`${successCount} of ${bookingPromises.length} bookings submitted. Some failed.`);
          const failedSlots = selectedSlots.filter((_, idx) => !results[idx].success);
          setSelectedSlots(failedSlots);
        }
      } else {
        // Semester booking - CHỈ TẠO 1 BOOKING duy nhất
        // Tạo 1 booking cho mỗi time slot (vì có thể chọn nhiều time slots)
        const bookingPromises = selectedSlots.map((slot) => {
          return bookingsApi.create({
            roomId: room.id,
            roomName: room.name,
            campus: room.campus,
            building: room.building,
            category: room.category,
            date: semesterStart!.toISOString().split("T")[0], // Ngày bắt đầu kỳ
            startTime: slot.startTime,
            endTime: slot.endTime,
            purpose: `[SEMESTER] ${purpose}`,
            userId: user.id,
            userName: user.name,
            userRole: user.role as "student" | "lecturer",
            isSemester: true,
            semesterEndDate: semesterEnd!.toISOString().split("T")[0],
            recurringDays: selectedDays,
          });
        });

        const results = await Promise.all(bookingPromises);
        const allSuccess = results.every((r) => r.success);
        const successCount = results.filter((r) => r.success).length;

        setSubmitting(false);

        if (allSuccess) {
          const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const daysStr = selectedDays.map((d) => dayNames[d]).join(", ");
          toast.success(
            `Semester booking created! ${successCount} recurring booking(s) for ${daysStr} over 3 months.`
          );
          resetForm();
          onSuccess?.();
          onClose?.();
        } else {
          toast.error(`${successCount} of ${bookingPromises.length} bookings submitted. Some failed.`);
        }
      }
    } catch (err) {
      toast.error("Failed to submit booking requests");
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
  };
}
