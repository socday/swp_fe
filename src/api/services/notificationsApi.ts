import { adaptNotifications, type FrontendNotification } from '../apiAdapters';
import notificationsController from '../api/controllers/notificationsController';

export const notificationsApi = {
  async getAll(): Promise<FrontendNotification[]> {
    try {
      const data = await notificationsController.getNotifications();
      return adaptNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
};
