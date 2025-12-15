import { useState, useEffect } from "react";
import { toast } from "sonner";
import { bookingsApi, Booking } from "../../lib/api";

export function useMyBookings(userId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [userId]);

  const loadBookings = async () => {
    setLoading(true);
    const data = await bookingsApi.getByUser(userId);

    const sorted = data.sort(
      (a, b) =>
        new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );

    setBookings(sorted);
    setLoading(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
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
    loading,
    handleCancelBooking,
    getStatusBadgeType,
  };
}
