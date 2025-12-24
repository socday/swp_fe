import { adaptBooking, type FrontendBooking } from '../apiAdapters';
import type { SecurityTask } from '../api/types';
import { bookingsApi } from './bookingsApi';
import { reportsApi } from './reportsApi';
import securityTaskController from '../api/controllers/securityTaskController';
import type { ReportCreateRequest } from '../api/types/reportTypes';

export const securityApi = {
  async getTasks(): Promise<SecurityTask[]> {
    return securityTaskController.getPendingTasks();
  },

async getApprovedBookings(): Promise<FrontendBooking[]> {
  const bookings = await bookingsApi.getAll();

  return bookings.filter(b => b.status === "Approved");
},


  async completeTask(
    taskId: number,
    reportNote?: string
  ): Promise<boolean> {
    try {
      await securityTaskController.completeTask(taskId, {
        reportNote,
      }
    );
      return true;
    } catch (error) {
      console.error('Complete task failed:', error);
      return false;
    }
  },
async submitReport(report: ReportCreateRequest): Promise<boolean> {
  const result = await reportsApi.create(report);
  return result.success;
}
};