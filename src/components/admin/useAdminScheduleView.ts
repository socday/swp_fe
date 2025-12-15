import { useState, useEffect } from 'react';
import { bookingsApi, roomsApi } from '../../api/api';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'lecturer';
  date: string;
  timeSlot: string;
  startTime?: string;
  endTime?: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  campus: 'FU_FPT' | 'NVH';
}

export const TIME_SLOTS = [
  { id: 1, label: 'Slot 1', displayTime: '7:00-9:00', startTime: '07:00', endTime: '09:00', value: '07:00-09:00' },
  { id: 2, label: 'Slot 2', displayTime: '9:00-11:00', startTime: '09:00', endTime: '11:00', value: '09:00-11:00' },
  { id: 3, label: 'Slot 3', displayTime: '12:00-14:00', startTime: '12:00', endTime: '14:00', value: '12:00-14:00' },
  { id: 4, label: 'Slot 4', displayTime: '14:00-16:00', startTime: '14:00', endTime: '16:00', value: '14:00-16:00' },
  { id: 5, label: 'Slot 5', displayTime: '16:00-18:00', startTime: '16:00', endTime: '18:00', value: '16:00-18:00' },
];

interface SelectedSlotBookings {
  bookings: Booking[];
  slotLabel: string;
  date: string;
}

export function useAdminScheduleView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotBookings, setSelectedSlotBookings] = useState<SelectedSlotBookings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const bookingsData = await bookingsApi.getAll();
      const roomsData = await roomsApi.getAll();

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
        const room = roomsData.find((r: any) => r.id === booking.roomId);
        const bookingWithRoom = {
          ...booking,
          roomName: room?.name || 'Unknown Room',
          campus: room?.campus || 'FU_FPT',
        };
        return expandSemesterBooking(bookingWithRoom);
      });

      console.log('All bookings (expanded):', expandedBookings);
      console.log('Approved bookings:', expandedBookings.filter((b: Booking) => b.status === 'approved'));

      setBookings(expandedBookings);
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
    const slot = TIME_SLOTS.find(s => s.id === slotId);
    if (!slot) return [];

    const filtered = bookings.filter(booking => {
      const matchesDate = booking.date === dateKey;
      
      const bookingSlot = booking.timeSlot?.trim();
      const matchesSlot = 
        bookingSlot === slot.value ||
        bookingSlot === slot.displayTime ||
        bookingSlot === slot.label ||
        bookingSlot === `Slot ${slot.id}` ||
        booking.startTime === slot.startTime;
      
      const matchesCampus = selectedCampus === 'all' || booking.campus === selectedCampus;
      
      if (matchesDate && booking.date && booking.timeSlot) {
        console.log('Checking booking for date match:', {
          bookingId: booking.id,
          bookingDate: booking.date,
          dateKey,
          bookingTimeSlot: booking.timeSlot,
          slotValue: slot.value,
          slotLabel: slot.label,
          matchesSlot,
          matchesCampus,
          matches: matchesDate && matchesSlot && matchesCampus
        });
      }
      
      return matchesDate && matchesSlot && matchesCampus;
    });

    return filtered;
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