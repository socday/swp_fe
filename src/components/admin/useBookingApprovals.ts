import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { bookingsApi, Booking } from '../../lib/api';

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

  const handleApprove = async (bookingId: string) => {
    const success = await bookingsApi.updateStatus(bookingId, 'Approved');
    if (success) {
      toast.success('Booking request approved');
      loadBookings();
    } else {
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId: string) => {
    const success = await bookingsApi.updateStatus(bookingId, 'Rejected');
    if (success) {
      toast.error('Booking request rejected');
      loadBookings();
    } else {
      toast.error('Failed to reject booking');
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
