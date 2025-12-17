import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  CompleteTaskRequest,
  CreateUserRequest,
  SecurityTask,
} from '../types';

export const securityTaskController = {
  // Assign task (Admin / Manager / FacilityAdmin)
  async assignTask(payload: CreateUserRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>(
      '/SecurityTask/assign',
      payload
    );
    return data;
  },

  // Get pending tasks
  async getPendingTasks(): Promise<SecurityTask[]> {
    const { data } = await apiClient.get<SecurityTask[]>(
      '/SecurityTask/pending'
    );
    return data;
  },

  // Complete task (Security)
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
