import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { bookingsApi, Booking, securityTasksApi } from '../../api/api';
import type { BookingForSecurityTask, SecurityStaffMember } from '../../api/services/securityTasksApi';
import type { RecurringBookingSummary } from '../../api/api/types';

export function useBookingApprovals() {
  const [bookingType, setBookingType] = useState<"individual" | "recurring">("individual");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recurringGroups, setRecurringGroups] = useState<RecurringBookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [securityStaff, setSecurityStaff] = useState<SecurityStaffMember[]>([]);

  useEffect(() => {
    loadSecurityStaff();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadBookings(1, pageSize);
  }, [bookingType]);

  const loadSecurityStaff = async () => {
    try {
      const staff = await securityTasksApi.getSecurityStaffWithTaskCounts();
      setSecurityStaff(staff);
    } catch (error) {
      console.error('Failed to load security staff:', error);
    }
  };

  const loadBookings = async (page: number = currentPage, size: number = pageSize) => {
    setLoading(true);
    try {
      if (bookingType === "individual") {
        const paginatedData = await bookingsApi.getFilteredPaginated({
          pageIndex: page,
          pageSize: size,
        });
        console.log('Fetched paginated bookings for approval:', paginatedData);
        // Sort by request date (newest first)
        const sorted = paginatedData.bookings.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
        setBookings(sorted);
        setTotalRecords(paginatedData.totalRecords);
        setCurrentPage(paginatedData.pageIndex);
        setPageSize(paginatedData.pageSize);
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

  const handleApprove = async (bookingId: string | number, assignedToUserId?: number) => {
    const numericId = normalizeBookingId(bookingId);
    if (Number.isNaN(numericId)) {
      toast.error('Invalid booking identifier');
      return;
    }

    if (!assignedToUserId) {
      toast.error('Please select a security staff member');
      return;
    }

    const result = await bookingsApi.updateStatus(numericId, { 
      status: 'Approved',
      assignedToUserId 
    });
    if (result.success) {
      toast.success(result.message || 'Booking approved and security task assigned.');
      loadBookings(currentPage, pageSize);
      loadSecurityStaff(); // Refresh staff counts
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
      loadBookings(currentPage, pageSize);
    } else {
      toast.error(result.error || 'Failed to reject booking');
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

  const pendingRequests = bookings.filter(r => r.status === 'Pending');
  const approvedRequests = bookings.filter(r => r.status === 'Approved');
  const rejectedRequests = bookings.filter(r => r.status === 'Rejected');

  return {
    bookings,
    recurringGroups,
    loading,
    bookingType,
    setBookingType,
    currentPage,
    pageSize,
    totalRecords,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    securityStaff,
    handleApprove,
    handleReject,
    handlePageChange,
    handlePageSizeChange,
  };
}
