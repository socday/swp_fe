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

  const loadBookings = useCallback(async () => {
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
        const [rawBookings, rooms] = await Promise.all([
          bookingsApi.getBookingIndividual(Number.isNaN(numericUserId) ? undefined : numericUserId) as Promise<RawBooking[] | PaginatedBookingResponse>,
          roomsApi.getAll(),
        ]);
        console.log('Raw individual bookings fetched:', rawBookings);
        const items = extractItems(rawBookings);
        const roomMapById = new Map(rooms.map((room) => [room.id.toString(), room]));
        const roomMapByName = new Map(
          rooms.map((room) => [room.name.toLowerCase(), room])
        );

        const mapped = items.map((booking) => {
          const facilityKey = normaliseRoomKey(booking.facilityId);
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
            normaliseIsoDate(booking.bookingDate || booking.date) ||
            new Date().toISOString().split("T")[0];

          return {
            id: booking.bookingId ?? booking.id ?? 0,
            facilityId: booking.facilityId,
            roomImageKey:
              room?.id || facilityKey || booking.facilityName || "room",
            facilityName: booking.facilityName || room?.name || "Facility",
            campusLabel: booking.campusName || room?.campus,
            buildingLabel: room?.building,
            date: normalizedDate,
            slotLabel: slotInfo.slotLabel,
            slotDisplayTime: slotInfo.slotDisplayTime,
            status: booking.status || "Pending",
            purpose: booking.purpose,
          } satisfies UserBookingSummary;
        });

        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setBookings(mapped);
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
  }, [userId, bookingType]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

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

  return {
    bookings,
    recurringGroups,
    loading,
    bookingType,
    setBookingType,
    handleCancelBooking,
    getStatusBadgeType,
    refreshBookings: loadBookings,
  };
}
