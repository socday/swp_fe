import { useState, useEffect } from 'react';
import { bookingsApi, roomsApi } from '../../api/api';
import { fetchTimeSlots, getCachedTimeSlots, type TimeSlot } from '../../api/timeSlots';

export interface Booking {
  id: string;
  roomId: string;
  facilityName?: string;
  roomName: string;
  userId: string;
  userName: string;
  bookedBy?: string;
  userRole: 'student' | 'lecturer';
  date: string;
  timeSlot?: string;
  slotId?: number;
  slotName?: string;
  startTime?: string;
  endTime?: string;
  purpose: string;
  status: string;
  campus: string;
}

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
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(getCachedTimeSlots());
  const [selectedSlotBookings, setSelectedSlotBookings] = useState<SelectedSlotBookings | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [currentDate]); // Reload khi đổi tuần

  useEffect(() => {
    fetchTimeSlots().then(slots => setTimeSlots(slots)).catch(() => {});
  }, []);

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const loadBookings = async () => {
    setLoading(true);
    try {
      const week = getWeekDates();
      const fromDate = formatDateKey(week[0]);
      const toDate = formatDateKey(week[6]);

      // API Filter: Backend thường yêu cầu status 'Approved'
      const filters: any = { status: 'Approved', fromDate, toDate };
      const paginatedResult = await bookingsApi.getFiltered(filters);
      let rawBookings = paginatedResult.bookings || [];
      console.log('🟡 RAW BOOKINGS FROM API:', rawBookings);
      if (rawBookings.length === 0) {
        rawBookings = await bookingsApi.getFiltered(filters);
      }

      const roomsData = await roomsApi.getAll();

      // Map dữ liệu để fix lỗi sai lệch key giữa PascalCase (API) và camelCase (Frontend)
      const normalizedBookings: Booking[] = rawBookings.map((b: any) => {
        // Tìm room để lấy campus và tên phòng chính xác
        const fId = b.facilityId || b.facilityID || b.roomId;
        const room = roomsData.find((r: any) => String(r.id) === String(fId));

        return {
          id: String(b.id || b.bookingId || b.BookingID),
          roomId: String(fId),
          roomName: room?.name || b.facilityName || b.roomName || 'N/A',
          facilityName: room?.name || b.facilityName,
          userId: String(b.userId || b.UserId),
          userName: b.bookedBy || b.userName || b.UserName || 'User',
          bookedBy: b.bookedBy || b.userName,
          // Giả định role dựa trên logic của bạn hoặc API
          userRole: String(b.userRole || b.RoleName || '').toLowerCase().includes('lecturer') ? 'lecturer' : 'student',
          date: b.date ? b.date.split('T')[0] : '',
          slotId: Number(b.slotId || b.SlotID || b.slotID),
          timeSlot: b.timeSlot || b.SlotName || b.slotName,
          slotName: b.slotName || b.SlotName,
          purpose: b.purpose || b.Purpose || '',
          status: String(b.status || b.Status || '').toLowerCase(),
          campus: room?.campus || 'FU_FPT',
        };
      });

      // Lọc lại một lần nữa chỉ lấy Approved (đề phòng API trả về cả Pending)
      setBookings(normalizedBookings.filter(b => b.status === 'approved'));
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingsForDateAndSlot = (date: Date, slotId: number) => {
    const dateKey = formatDateKey(date);
    
    return bookings.filter(booking => {
      const matchesDate = booking.date === dateKey;
      const matchesSlot = booking.slotId === slotId;
      const matchesCampus = selectedCampus === 'all' || booking.campus === selectedCampus;
      
      return matchesDate && matchesSlot && matchesCampus;
    });
  };

  // Các hàm helper giữ nguyên
  const getWeekDates = () => {
    const week: Date[] = [];
    const startOfWeek = new Date(currentDate);
    const day = currentDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    startOfWeek.setDate(currentDate.getDate() + diff);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const goToPreviousWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const goToNextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
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