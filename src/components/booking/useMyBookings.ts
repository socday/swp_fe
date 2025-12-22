import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { bookingsApi, roomsApi } from "../../api/api";
import { getSlotById, getSlotByTime, TimeSlot } from "../../api/timeSlots";
import type { RecurringBookingSummary } from "../../api/api/types";

export interface UserBookingSummary {
  id: number;
  facilityId?: number;
  roomImageKey: string;
  facilityName: string;
  campusLabel?: string;
  buildingLabel?: string;
  date?: string;
  slotLabel: string;
  slotDisplayTime: string;
  status: string;
  purpose?: string;
}

type RawBooking = {
  bookingId?: number;
  id?: number;
  facilityId?: number;
  facilityName?: string;
  campusName?: string;
  bookingDate?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  slotId?: number;
  slotName?: string;
  status?: string;
  bookedBy?: string;
  userId?: number;
  purpose?: string;
};

type PaginatedBookingResponse = {
  items?: RawBooking[];
  totalRecords?: number;
  pageIndex?: number;
  pageSize?: number;
};

const normaliseRoomKey = (facilityId?: number) =>
  facilityId !== undefined ? facilityId.toString() : "";

const normaliseIsoDate = (value?: string) => {
  if (!value) return "";
  const datePart = value.split("T")[0];
  return datePart;
};

const normaliseTime = (value?: string) => (value ? value.slice(0, 5) : undefined);

const mapSlot = (
  slotId?: number,
  slotName?: string,
  startTime?: string,
  endTime?: string
): Pick<UserBookingSummary, "slotLabel" | "slotDisplayTime"> => {
  const trimmedStart = normaliseTime(startTime);
  const trimmedEnd = normaliseTime(endTime);
  const slotById: TimeSlot | undefined = slotId !== undefined ? getSlotById(slotId) : undefined;
  const slotByTime = trimmedStart && trimmedEnd ? getSlotByTime(trimmedStart, trimmedEnd) : undefined;

  const slot = slotById || slotByTime;

  const fallbackLabel = slotName ||
    (trimmedStart && trimmedEnd ? `${trimmedStart} - ${trimmedEnd}` : "Slot");
  const fallbackDisplay =
    slot?.displayTime ||
    (trimmedStart && trimmedEnd ? `${trimmedStart} - ${trimmedEnd}` : "");

  return {
    slotLabel: slot?.label || fallbackLabel,
    slotDisplayTime: fallbackDisplay,
  };
};

const extractItems = (payload: RawBooking[] | PaginatedBookingResponse): RawBooking[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export function useMyBookings(userId: string) {
  const [bookingType, setBookingType] = useState<"individual" | "recurring">("individual");
  const [bookings, setBookings] = useState<UserBookingSummary[]>([]);
  const [recurringGroups, setRecurringGroups] = useState<RecurringBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest">("Oldest");
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  const loadBookings = useCallback(async (page: number = currentPage, size: number = pageSize) => {
    if (!userId) {
      setBookings([]);
      setRecurringGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const numericUserId = Number(userId);
      
      if (bookingType === "individual") {
        const [paginatedData, rooms] = await Promise.all([
          bookingsApi.getFilteredPaginated({
            userId: Number.isNaN(numericUserId) ? undefined : numericUserId,
            pageIndex: page,
            pageSize: 50, // Fetch more to filter on frontend
            sortBy: sortBy,
          }),
          roomsApi.getAll(),
        ]);
        console.log('Paginated individual bookings fetched:', paginatedData);
        const items = paginatedData.bookings;
        const roomMapById = new Map(rooms.map((room) => [room.id.toString(), room]));
        const roomMapByName = new Map(
          rooms.map((room) => [room.name.toLowerCase(), room])
        );

        const mapped = items.map((booking: any) => {
          const facilityKey = booking.facilityId?.toString() || "";
          const room =
            roomMapById.get(facilityKey) ||
            (booking.facilityName
              ? roomMapByName.get(booking.facilityName.toLowerCase())
              : undefined);
          const slotInfo = mapSlot(
            booking.slotId,
            booking.slotName,
            booking.startTime,
            booking.endTime
          );

          const normalizedDate =
            normaliseIsoDate(booking.date) ||
            new Date().toISOString().split("T")[0];

          return {
            id: booking.id ?? 0,
            facilityId: booking.facilityId,
            roomImageKey:
              room?.id || facilityKey || booking.facilityName || "room",
            facilityName: booking.facilityName || room?.name || "Facility",
            campusLabel: booking.campus || room?.campus,
            buildingLabel: room?.building,
            date: normalizedDate,
            slotLabel: slotInfo.slotLabel,
            slotDisplayTime: slotInfo.slotDisplayTime,
            status: booking.status || "Pending",
            purpose: booking.purpose,
          } satisfies UserBookingSummary;
        });

        // Filter for today's bookings if showTodayOnly is true
        const today = new Date().toISOString().split('T')[0];
        const filteredMapped = showTodayOnly 
          ? mapped.filter(booking => booking.date === today)
          : mapped;

        setBookings(filteredMapped);
        setTotalRecords(showTodayOnly ? filteredMapped.length : paginatedData.totalRecords);
        setCurrentPage(paginatedData.pageIndex);
        setPageSize(paginatedData.pageSize);
        setRecurringGroups([]);
      } else {
        // Fetch recurring booking groups
        const groups = await bookingsApi.getBookingRecurrenceGroup(Number.isNaN(numericUserId) ? undefined : numericUserId);
        console.log('Fetched recurring groups:', groups);
        setRecurringGroups(groups);
        setBookings([]);
      }
    } catch (error) {
      console.error("Failed to load bookings", error);
      toast.error("Unable to load bookings. Please try again later.");
      setBookings([]);
      setRecurringGroups([]);
    } finally {
      setLoading(false);
    }
  }, [userId, bookingType, currentPage, pageSize, sortBy, showTodayOnly]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    loadBookings(1, pageSize);
  }, [bookingType, userId, sortBy, showTodayOnly]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!bookingId) {
      toast.error("Unable to cancel this booking (missing ID)");
      return;
    }

    const success = await bookingsApi.cancel(bookingId);
    if (success) {
      toast.success("Booking cancelled successfully");
      loadBookings();
    } else {
      toast.error("Failed to cancel booking");
    }
  };

  const getStatusBadgeType = (status: string) => {
    switch (status) {
      case "Approved":
        return "approved";
      case "Pending":
        return "pending";
      case "Rejected":
        return "rejected";
      case "Cancelled":
        return "cancelled";
      default:
        return "unknown";
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadBookings(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    loadBookings(1, newSize);
  };

  return {
    bookings,
    recurringGroups,
    loading,
    bookingType,
    setBookingType,
    sortBy,
    setSortBy,
    showTodayOnly,
    setShowTodayOnly,
    currentPage,
    pageSize,
    totalRecords,
    handleCancelBooking,
    getStatusBadgeType,
    refreshBookings: () => loadBookings(currentPage, pageSize),
    handlePageChange,
    handlePageSizeChange,
  };
}
