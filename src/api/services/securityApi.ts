import { type FrontendBooking } from '../apiAdapters';
import type { Report } from '../api/types';
import { bookingsApi } from './bookingsApi';
import { reportsApi } from './reportsApi';

export const securityApi = {
  async getTasks(): Promise<any[]> {
    console.warn('securityApi.getTasks() not implemented for backend');
    return [];
  },
  async getApprovedBookings(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll('Approved');
  },
  async completeTask(): Promise<boolean> {
    console.warn('securityApi.completeTask() not implemented for backend');
    return false;
  },
  async submitReport(
    report: Omit<Report, 'reportId' | 'userId' | 'status' | 'createdAt'>
  ): Promise<boolean> {
    const result = await reportsApi.create({
      facilityId: report.facilityId || 0,
      title: (report as any).title || 'Security Report',
      description: (report as any).description || '',
      reportType: (report as any).reportType || 'Security',
      bookingId: report.bookingId,
    });
    return result.success;
  },
};
