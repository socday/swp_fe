import { useState, useEffect } from 'react';
import { bookingsApi, roomsApi } from '../../api/api';
import { fetchTimeSlots, getCachedTimeSlots, type TimeSlot } from '../../api/timeSlots';

export interface Booking {
  id: string;
  roomId: string;
  // Backwards-compatible: the source-of-truth for the API room label is `facilityName`
  facilityName?: string;
  roomName: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'lecturer';
  date: string;
  timeSlot: string;
  slotId?: number;
  slotName?: string;
  startTime?: string;
  endTime?: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  campus: 'FU_FPT' | 'NVH';
}

interface SelectedSlotBookings {
  bookings: Booking[];
  slotLabel: string;
  date: string;
}

const normalizeSlotLabel = (value?: string): string =>
  value ? value.replace(/\s+/g, '').toLowerCase() : '';

const normalizeTime = (value?: string): string => {
  if (!value) return '';
  const [hours = '00', minutes = '00'] = value.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

export function useAdminScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(getCachedTimeSlots());
  const [selectedSlotBookings, setSelectedSlotBookings] = useState<SelectedSlotBookings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetchTimeSlots()
      .then((slots) => {
        if (isMounted) {
          setTimeSlots(slots);
        }
      })
      .catch(() => {
        /* fallback handled by helper */
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const bookingsData = await bookingsApi.getAll();
      const roomsData = await roomsApi.getAll();

      // Fetch users once to resolve roles (for coloring)
      let usersMap: Record<number, string> = {};
      try {
        const usersResp = await (await import('../../api/api/controllers/usersController')).default.getUsers({ pageSize: 1000 } as any);
        const userItems = (usersResp && (usersResp as any).items) || [];
        usersMap = userItems.reduce((acc: Record<number, string>, u: any) => {
          if (u.userId) acc[u.userId] = (u.roleName || '').toLowerCase();
          return acc;
        }, {});
      } catch (e) {
        console.warn('Unable to fetch users for role mapping:', e);
      }

      // Helper function để expand semester booking thành individual bookings cho hiển thị
      const expandSemesterBooking = (booking: any) => {
        if (!booking.isSemester || !booking.semesterEndDate || !booking.recurringDays) {
          return [booking]; // Single booking, return as is
        }

        // Generate all dates for semester booking
        const dates: string[] = [];
        const current = new Date(booking.date);
        const end = new Date(booking.semesterEndDate);
        
        while (current <= end) {
          const dayOfWeek = current.getDay();
          if (booking.recurringDays.includes(dayOfWeek)) {
            dates.push(current.toISOString().split('T')[0]);
          }
          current.setDate(current.getDate() + 1);
        }

        // Create individual booking object for each date
        return dates.map((date, index) => ({
          ...booking,
          id: `${booking.id}-${index}`, // Unique ID for each instance
          date: date,
          _originalSemesterId: booking.id, // Keep reference to original
          _isExpandedSemester: true,
        }));
      };

      // Expand all bookings
      const expandedBookings = bookingsData.flatMap((booking: any) => {
        // Use facilityId (backend) or roomId fallback to find corresponding room
        const facilityIdValue = booking.facilityId ?? booking.roomId ?? '';
        const room = roomsData.find((r: any) => r.id === String(facilityIdValue));

        const bookingWithRoom = {
          ...booking,
          roomId: String(facilityIdValue),
          roomName: room?.name || 'Unknown Room',
          campus: room?.campus || 'FU_FPT',
          slotId: booking.slotId,
          slotName: booking.slotName,
          startTime: booking.startTime,
          endTime: booking.endTime,
          // Map userRole using usersMap (default to student)
          userRole: usersMap[booking.userId] && usersMap[booking.userId].includes('lecturer') ? 'lecturer' : 'student',
        };
        return expandSemesterBooking(bookingWithRoom);
      });

      console.log('All bookings (expanded):', expandedBookings);
      const approvedBookings = expandedBookings.filter((b: Booking) => String(b.status).toLowerCase() === 'approved');
      console.log('Approved bookings:', approvedBookings);

      // Only keep approved bookings for the schedule display
      setBookings(approvedBookings);
    } catch (error) {
      console.error('Error fetching schedule data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const week = [];
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

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getBookingsForDateAndSlot = (date: Date, slotId: number) => {
    const dateKey = formatDateKey(date);
    const slot = timeSlots.find((s) => s.id === slotId);
    if (!slot) return [];

    const filtered = bookings.filter(booking => {
      const matchesDate = booking.date === dateKey;

      const bookingSlot = booking.timeSlot?.trim();
      const bookingSlotName = booking.slotName?.trim();
      const normalizedBookingSlot = normalizeSlotLabel(bookingSlot);
      const normalizedBookingSlotName = normalizeSlotLabel(bookingSlotName);
      const slotCandidates = [
        slot.label,
        slot.displayTime,
        slot.displayTime.replace(/\s+/g, ''),
        `${slot.startTime}-${slot.endTime}`,
        `${slot.startTime} - ${slot.endTime}`,
        `Slot ${slot.id}`,
        `Slot${slot.id}`,
      ];
      const normalizedSlotCandidates = slotCandidates.map(normalizeSlotLabel);
      const matchesSlotName = normalizedSlotCandidates.includes(normalizedBookingSlotName);
      const matchesSlotString = normalizedSlotCandidates.includes(normalizedBookingSlot);
      const matchesSlotId = typeof booking.slotId === 'number' && booking.slotId === slot.id;
      const matchesTimes =
        normalizeTime(booking.startTime) === slot.startTime &&
        normalizeTime(booking.endTime) === slot.endTime;
      const matchesSlot = matchesSlotId || matchesSlotString || matchesSlotName || matchesTimes;
      
      const matchesCampus = selectedCampus === 'all' || booking.campus === selectedCampus;
      
      if (matchesDate && booking.date && booking.timeSlot) {
        console.log('Checking booking for date match:', {
          bookingId: booking.id,
          bookingDate: booking.date,
          dateKey,
          bookingTimeSlot: booking.timeSlot,
          slotLabel: slot.label,
          matchesSlot,
          matchesCampus,
          matches: matchesDate && matchesSlot && matchesCampus
        });
      }
      
      return matchesDate && matchesSlot && matchesCampus;
    });

    // Ensure only approved bookings are considered (defensive check)
    return filtered.filter(b => String(b.status).toLowerCase() === 'approved');
  };

  const handleBookingClick = (bookings: Booking[], slotLabel: string, date: string) => {
    setSelectedSlotBookings({ bookings, slotLabel, date });
    setIsDialogOpen(true);
  };

  return {
    currentDate,
    selectedCampus,
    setSelectedCampus,
    bookings,
    loading,
    timeSlots,
    selectedSlotBookings,
    isDialogOpen,
    setIsDialogOpen,
    getWeekDates,
    goToPreviousWeek,
    goToNextWeek,
    formatDateKey,
    getBookingsForDateAndSlot,
    handleBookingClick,
  };
}