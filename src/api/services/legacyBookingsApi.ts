import { bookingsApi } from './bookingsApi';

export const legacyBookingsApi = {
  async getAll(): Promise<any[]> {
    const bookings = await bookingsApi.getAll();
    return bookings.map((b: any) => ({
      ...b,
      id: b.id?.toString?.() || b.bookingId?.toString?.() || '',
      roomId: b.facilityId?.toString?.() || '',
      userId: b.userId?.toString?.() || '',
    }));
  },

  async getByUser(userId: string): Promise<any[]> {
    const allBookings = await legacyBookingsApi.getAll();
    return allBookings.filter((b) => b.userId === userId);
  },

  async create(_booking: any): Promise<{ success: boolean; id?: string; error?: string }> {
    console.warn('Legacy bookingsApi.create() called. This needs proper implementation.');
    return { success: false, error: 'Not yet implemented for backend' };
  },

  async updateStatus(id: string | number, status: string): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    const result = await bookingsApi.updateStatus(numericId, { status });
    return result.success;
  },

  async cancel(_id: string | number): Promise<boolean> {
    console.warn('bookingsApi.cancel() not in backend spec');
    return false;
  },

  async getSchedule(startDate: string, endDate: string): Promise<any[]> {
    const allBookings = await legacyBookingsApi.getAll();
    return allBookings.filter((b: any) => {
      const bookingDate = new Date(b.date || b.bookingDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return bookingDate >= start && bookingDate <= end;
    });
  },
};
