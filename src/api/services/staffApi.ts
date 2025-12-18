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
    return securityTasksApi.getPendingTasks();  
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
  async updateReportStatus(reportId: string, status: string, notes?: string): Promise<boolean> {
    if (status === 'Resolved') {
      const numericId = parseInt(reportId, 10);
      return reportsApi.resolve(numericId, notes || '');
    }
    console.warn('staffApi.updateReportStatus() partially implemented');
    return false;
  },
};
