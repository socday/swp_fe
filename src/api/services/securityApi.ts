import { type FrontendBooking } from '../apiAdapters';
import type { Report, SecurityTask } from '../api/types';
import { bookingsApi } from './bookingsApi';
import { reportsApi } from './reportsApi';
import securityTaskController from '../api/controllers/securityTaskController';

export const securityApi = {
  // 🔹 Security xem danh sách task
  async getTasks(): Promise<SecurityTask[]> {
    return securityTaskController.getPendingTasks();
  },

  // 🔹 Lấy booking đã approved (giữ nguyên)
  async getApprovedBookings(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll('Approved');
  },

  // 🔹 Security complete task
  async completeTask(
    taskId: number,
    reportNote?: string
  ): Promise<boolean> {
    try {
      await securityTaskController.completeTask(taskId, {
        reportNote,
      });
      return true;
    } catch (error) {
      console.error('Complete task failed:', error);
      return false;
    }
  },

  // 🔹 Submit report (GIỮ NGUYÊN)
  async submitReport(
    report: Omit<Report, 'reportId' | 'userId' | 'status' | 'createdAt'>
  ): Promise<boolean> {
    const result = await reportsApi.create({
      facilityId: report.facilityId || 0,
      title: report.title || 'Security Report',
      description: report.description || '',
      reportType: report.reportType || 'Security',
      bookingId: report.bookingId,
    });
    return result.success;
  },
};
