import type { BookingFilterRequest } from '../api';
import { type FrontendBooking, type FrontendReport } from '../apiAdapters';
import { bookingsApi } from './bookingsApi';
import { reportsApi } from './reportsApi';
import { SecurityTask, securityTasksApi } from './securityTasksApi';

export const staffApi = {
  async getPendingBookings(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll('Pending');
  },
  async getBookingHistory(pageIndex: number): Promise<FrontendBooking[]> {
    let filters : BookingFilterRequest = {
      pageIndex,
    }
    return bookingsApi.getFiltered(filters);
  },
  async getSecurityTasks(): Promise<SecurityTask[]> {
    return securityTasksApi.getSecurityTasks();  
  },
  async getReports(): Promise<FrontendReport[]> {
    return reportsApi.getAll();
  },
  async createSecurityTask(): Promise<string | null> {
    console.warn('staffApi.createSecurityTask() not implemented for backend');
    return null;
  },
  async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    const numericId = parseInt(bookingId, 10);
    const result = await bookingsApi.updateStatus(numericId, {
      status: 'Cancelled',
      rejectionReason: reason,
    });
    return result.success;
  },
 async updateReportStatus(
  reportId: number | string,
  status: string,
  notes?: string
): Promise<boolean> {
  try {
    const numericId = typeof reportId === 'string'
      ? parseInt(reportId, 10)
      : reportId;

    if (Number.isNaN(numericId)) {
      console.error("Invalid reportId:", reportId);
      return false;
    }

    console.log("Updating report:", {
      reportId: numericId,
      status,
      notes,
    });

    return await reportsApi.updateStatus(numericId, {
      status,
      staffResponse: notes,
    });
  } catch (error) {
    console.error("updateReportStatus error:", error);
    return false;
  }
}
};
