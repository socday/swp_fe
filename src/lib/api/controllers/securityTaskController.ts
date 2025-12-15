import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  CompleteTaskRequest,
  CreateTaskRequest,
  SecurityTask,
} from '../types';

export const securityTaskController = {
  async assignTask(payload: CreateTaskRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/SecurityTask/assign', payload);
    return data;
  },

  async getPendingTasks(): Promise<SecurityTask[]> {
    const { data } = await apiClient.get<SecurityTask[]>('/SecurityTask/pending');
    return data;
  },

  async completeTask(taskId: number, payload: CompleteTaskRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/SecurityTask/complete/${taskId}`, payload);
    return data;
  },
};

export default securityTaskController;
