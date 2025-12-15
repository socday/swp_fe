import { apiClient } from '../../httpClient';
import type { ApiMessageResponse, CreateNotiRequest, Notification } from '../types';

export const notificationsController = {
  async getNotifications(): Promise<Notification[]> {
    const { data } = await apiClient.get<Notification[]>('/Notifications');
    return data;
  },

  async createNotification(payload: CreateNotiRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/Notifications/create', payload);
    return data;
  },
};

export default notificationsController;
