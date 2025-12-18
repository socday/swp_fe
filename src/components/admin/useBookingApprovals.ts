import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { bookingsApi, Booking, securityTasksApi } from '../../api/api';
import type { BookingForSecurityTask } from '../../api/services/securityTasksApi';
import type { RecurringBookingSummary } from '../../api/api/types';

export function useBookingApprovals() {
  const [bookingType, setBookingType] = useState<"individual" | "recurring">("individual");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recurringGroups, setRecurringGroups] = useState<RecurringBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, [bookingType]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      if (bookingType === "individual") {
        const data = await bookingsApi.getBookingIndividual();
        console.log('Fetched individual bookings for approval:', data);
        // Sort by request date (newest first)
        const sorted = data.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        setBookings(sorted);
        setRecurringGroups([]);
      } else {
        // Fetch all recurring booking groups (no specific user filter for admin)
        const groups = await bookingsApi.getBookingRecurrenceGroup();
        setRecurringGroups(groups);
        setBookings([]);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const normalizeBookingId = (bookingId: string | number): number =>
    typeof bookingId === 'string' ? parseInt(bookingId, 10) : bookingId;

  const assignSecurityTaskIfPossible = async (bookingId: number) => {
    const bookingContext = bookings.find((booking) => normalizeBookingId(booking.id) === bookingId);
    if (!bookingContext) {
      console.warn('Unable to find booking for security task assignment');
      return;
    }

    try {
      const assignment = await securityTasksApi.autoAssignForBooking(
        bookingContext as BookingForSecurityTask
      );
      if (assignment.success) {
        toast.success(assignment.message || 'Security task assigned');
      } else if (assignment.error) {
        toast.error(assignment.error);
      }
    } catch (error) {
      console.error('Security task auto-assignment failed:', error);
      toast.error('Security task assignment failed');
    }
  };

  const handleApprove = async (bookingId: string | number) => {
    const numericId = normalizeBookingId(bookingId);
    if (Number.isNaN(numericId)) {
      toast.error('Invalid booking identifier');
      return;
    }

    const result = await bookingsApi.updateStatus(numericId, { status: 'Approved' });
    if (result.success) {
      toast.success(result.message || 'Booking request approved');
      await assignSecurityTaskIfPossible(numericId);
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
    recurringGroups,
    loading,
    bookingType,
    setBookingType,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    handleApprove,
    handleReject,
  };
}
