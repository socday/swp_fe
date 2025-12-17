import securityTaskController from '../api/controllers/securityTaskController';
import type { SecurityTask } from '../api/types';
import { safeErrorMessage } from './common';

export const securityTasksApi = {
  // 🔹 Get pending security tasks
  async getPendingTasks(): Promise<SecurityTask[]> {
    try {
      return await securityTaskController.getPendingTasks();
    } catch (error) {
      console.error('Failed to load pending security tasks:', error);
      return [];
    }
  },

  // 🔹 Confirm / complete security task
  async completeTask(
    taskId: number,
    reportNote?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await securityTaskController.completeTask(taskId, {
        reportNote,
      });

      return {
        success: true,
        message: response?.message ?? 'Đã hoàn thành nhiệm vụ',
      };
    } catch (error) {
      const message = safeErrorMessage(error, 'Failed to complete security task');
      console.error('Complete security task failed:', error);
      return { success: false, error: message };
    }
  },
};

export type { SecurityTask };
