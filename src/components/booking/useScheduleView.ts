// import { useState, useEffect, useCallback } from "react";
// import { toast } from "sonner";
// import { bookingsApi, roomsApi } from "../../api/api";
// import { fetchTimeSlots, TimeSlot } from "../../api/timeSlots";

// const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
// const campusIdFromName = (campus?: string) => {
//   if (campus === "NVH") return 2;
//   if (campus === "FU_FPT") return 1;
//   return undefined;
// };

// export interface ScheduleBooking {
//   id: number;
//   date: string;
//   slotId?: number;
//   slotName?: string;
//   facilityName: string;
//   campus?: string;
//   purpose?: string;
//   userId?: string;
// }

// export function useScheduleView(userId?: string) {
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedCampus, setSelectedCampus] = useState("all");
//   const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

//   const loadBookings = useCallback(async () => {
//     setLoading(true);

//     try {
//       const campusFilterId = selectedCampus === "all" ? undefined : campusIdFromName(selectedCampus);
//       const filters = campusFilterId
//         ? { status: "Approved", campusId: campusFilterId }
//         : { status: "Approved" };
//       const [bookingData, rooms] = await Promise.all([
//         bookingsApi.getFiltered(filters),
//         roomsApi.getAll(),
//       ]);

//       const roomMap = new Map(rooms.map((room) => [room.id.toString(), room]));

//       const mapped: ScheduleBooking[] = bookingData.map((booking) => {
//   const room = roomMap.get(String(booking.facilityId));

//   return {
//     id: booking.id,
//     date: booking.date,               
//     slotId: Number(booking.slotId),   
//     facilityName: room?.name ?? "Facility",
//     campus: room?.campus,
//     purpose: booking.purpose,
//     userId: String(booking.userId),   
//   };
// });

//       setBookings(mapped);
//     } catch (error) {
//       console.error("Failed to load schedule data", error);
//       toast.error("Unable to load schedule data. Please try again later.");
//       setBookings([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedCampus]);

//   useEffect(() => {
//     loadBookings();
//   }, [loadBookings]);

//   useEffect(() => {
//     fetchTimeSlots().then(setTimeSlots).catch(console.error);
//   }, []);

//   const getWeekDates = () => {
//     const week: Date[] = [];
//     const startOfWeek = new Date(currentDate);

//     const day = currentDate.getDay();
//     const diff = day === 0 ? -6 : 1 - day;

//     startOfWeek.setDate(currentDate.getDate() + diff);

//     for (let i = 0; i < 7; i++) {
//       const date = new Date(startOfWeek);
//       date.setDate(startOfWeek.getDate() + i);
//       week.push(date);
//     }

//     return week;
//   };

//   const weekDates = getWeekDates();

//   const goToPreviousWeek = () => {
//     const newDate = new Date(currentDate);
//     newDate.setDate(currentDate.getDate() - 7);
//     setCurrentDate(newDate);
//   };

//   const goToNextWeek = () => {
//     const newDate = new Date(currentDate);
//     newDate.setDate(currentDate.getDate() + 7);
//     setCurrentDate(newDate);
//   };

//   const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

//   const getBookingsForDateAndSlot = (date: Date, slotId: number) => {
//     const key = formatDateKey(date);

//     return bookings.filter((booking) => {
//       const matchesDate = booking.date === key;
//       const matchesSlot = booking.slotId === slotId;
//       const matchesCampus =
//         selectedCampus === "all" || booking.campus === selectedCampus;

//       return matchesDate && matchesSlot && matchesCampus;
//     });
//   };

//   const getEventColor = (booking: ScheduleBooking) => {
//     if (!userId) {
//       return "bg-blue-100 border-blue-400 text-blue-900";
//     }

//     return booking.userId?.toString() === userId
//       ? "bg-orange-100 border-orange-400 text-orange-900"
//       : "bg-blue-100 border-blue-400 text-blue-900";
//   };

//   return {
//     daysOfWeek,
//     currentDate,
//     weekDates,
//     selectedCampus,
//     bookings,
//     loading,
//     timeSlots,

//     setSelectedCampus,
//     goToPreviousWeek,
//     goToNextWeek,
//     getBookingsForDateAndSlot,
//     getEventColor,
//     formatDateKey,
//   };
// }

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { bookingsApi, roomsApi } from "../../api/api";
import { fetchTimeSlots, TimeSlot } from "../../api/timeSlots";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const campusIdFromName = (campus?: string) => {
  if (campus === "NVH") return 2;
  if (campus === "FU_FPT") return 1;
  return undefined;
};

export interface ScheduleBooking {
  id: number;
  date: string;
  slotId?: number;
  slotName?: string;
  facilityName: string;
  campus?: string;
  purpose?: string;
  userId?: string;
}

export function useScheduleView(userId?: string) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [bookings, setBookings] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  const loadBookings = useCallback(async () => {
    setLoading(true);

    try {
      const campusFilterId = selectedCampus === "all" ? undefined : campusIdFromName(selectedCampus);
      
      const filters = campusFilterId
        ? { status: "Approved", campusId: campusFilterId }
        : { status: "Approved" };

      const [bookingData, rooms] = await Promise.all([
        bookingsApi.getFiltered(filters),
        roomsApi.getAll(),
      ]);

      const roomMap = new Map(rooms.map((room) => [room.id.toString(), room]));

      // --- PHẦN SỬA LOGIC MAP DỮ LIỆU ---
      const mapped: ScheduleBooking[] = bookingData.map((booking: any) => {
        // 1. Xử lý Facility/Room ID
        console.log("ITEM RAW:", JSON.stringify(booking, null, 2));
        const fId = booking.facilityId || booking.FacilityID;
        const room = roomMap.get(String(fId));

        // 2. Xử lý Slot ID (QUAN TRỌNG)
        // Dựa vào hình Swagger của bạn, API trả về "slotID" (s thường, ID hoa)
        // Code này sẽ thử tất cả các trường hợp để đảm bảo không bị NaN
        const rawSlotId = booking.slotID || booking.slotId || booking.SlotID;

        // 3. Xử lý Ngày tháng
        const rawDate = booking.bookingDate || booking.BookingDate || booking.date;
        let dateStr = "";
        if (rawDate) {
           if (typeof rawDate === 'string') {
             dateStr = rawDate.split('T')[0];
           } else {
             dateStr = new Date(rawDate).toISOString().split('T')[0];
           }
        }

        return {
          id: booking.id || booking.BookingID,
          date: dateStr,
          slotId: Number(rawSlotId), // Ép kiểu số
          facilityName: room?.name ?? "Facility",
          campus: room?.campus,
          purpose: booking.purpose || booking.Purpose,
          userId: String(booking.userId || booking.UserID),
        };
      });
      // ------------------------------------

      console.log("Mapped Bookings (Fixed):", mapped); // Kiểm tra log này
      setBookings(mapped);
    } catch (error) {
      console.error("Failed to load schedule data", error);
      toast.error("Unable to load schedule data. Please try again later.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCampus]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  useEffect(() => {
    fetchTimeSlots().then(setTimeSlots).catch(console.error);
  }, []);

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

    return bookings.filter((booking) => {
      // So sánh chuỗi ngày (đã được chuẩn hóa YYYY-MM-DD)
      const matchesDate = booking.date === key;
      // So sánh slotId (đã đảm bảo là số, không phải NaN)
      const matchesSlot = booking.slotId === slotId;
      const matchesCampus =
        selectedCampus === "all" || booking.campus === selectedCampus;

      return matchesDate && matchesSlot && matchesCampus;
    });
  };

  const getEventColor = (booking: ScheduleBooking) => {
    if (!userId) {
      return "bg-blue-100 border-blue-400 text-blue-900";
    }

    return booking.userId?.toString() === userId
      ? "bg-orange-100 border-orange-400 text-orange-900"
      : "bg-blue-100 border-blue-400 text-blue-900";
  };

  return {
    daysOfWeek,
    currentDate,
    weekDates,
    selectedCampus,
    bookings,
    loading,
    timeSlots,

    setSelectedCampus,
    goToPreviousWeek,
    goToNextWeek,
    getBookingsForDateAndSlot,
    getEventColor,
    formatDateKey,
  };
}