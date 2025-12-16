import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  CompleteTaskRequest,
  SecurityTask,
} from '../types';

export const securityTaskController = {
  // 🔹 Get all / pending security tasks
  async getPendingTasks(): Promise<SecurityTask[]> {
    const { data } = await apiClient.get<SecurityTask[]>(
      '/SecurityTask/pending'
    );
    return data;
  },

  // 🔹 Confirm / complete task
  async completeTask(
    taskId: number,
    payload?: CompleteTaskRequest
  ): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(
      `/SecurityTask/complete/${taskId}`,
      {
        reportNote: payload?.reportNote ?? 'Đã hoàn thành',
      }
    );

    return data;
  },
};

export default securityTaskController;
