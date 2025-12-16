import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { bookingsApi, Booking } from '../../api/api';

export function useBookingApprovals() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const data = await bookingsApi.getAll();
    // Sort by request date (newest first)
    const sorted = data.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
    setBookings(sorted);
    setLoading(false);
  };

  const normalizeBookingId = (bookingId: string | number): number =>
    typeof bookingId === 'string' ? parseInt(bookingId, 10) : bookingId;

  const handleApprove = async (bookingId: string | number) => {
    const numericId = normalizeBookingId(bookingId);
    if (Number.isNaN(numericId)) {
      toast.error('Invalid booking identifier');
      return;
    }

    const result = await bookingsApi.updateStatus(numericId, { status: 'Approved' });
    if (result.success) {
      toast.success(result.message || 'Booking request approved');
      loadBookings();
    } else {
      toast.error(result.error || 'Failed to approve booking');
    }
  };

  const handleReject = async (bookingId: string | number) => {
    const numericId = normalizeBookingId(bookingId);
    if (Number.isNaN(numericId)) {
      toast.error('Invalid booking identifier');
      return;
    }

    const result = await bookingsApi.updateStatus(numericId, { status: 'Rejected' });
    if (result.success) {
      toast.success(result.message || 'Booking request rejected');
      loadBookings();
    } else {
      toast.error(result.error || 'Failed to reject booking');
    }
  };

  const pendingRequests = bookings.filter(r => r.status === 'Pending');
  const approvedRequests = bookings.filter(r => r.status === 'Approved');
  const rejectedRequests = bookings.filter(r => r.status === 'Rejected');

  return {
    bookings,
    loading,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    handleApprove,
    handleReject,
  };
}
