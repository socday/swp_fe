import { type FrontendBooking } from '../apiAdapters';
import type { SecurityTask } from '../api/types';
import { bookingsApi } from './bookingsApi';
import { reportsApi } from './reportsApi';
import securityTaskController from '../api/controllers/securityTaskController';
import type { SecurityUIReport } from '../api/types/reportTypes';

export const securityApi = {
  async getTasks(): Promise<SecurityTask[]> {
    return securityTaskController.getPendingTasks();
  },

  async getApprovedBookings(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll('Approved');
  },

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
  async submitReport(report: SecurityUIReport): Promise<boolean> {
    const result = await reportsApi.create({
      facilityId: Number(report.roomId),
      title: report.type,              
      description: report.description,
      reportType: report.type,         
      bookingId: undefined,
    });
    return result.success;
  },
};
