import { adaptSlots, type FrontendSlot } from '../apiAdapters';
import slotsController from '../api/controllers/slotsController';

export const slotsApi = {
  async getAll(): Promise<FrontendSlot[]> {
    try {
      const slots = await slotsController.getSlots();
      return adaptSlots(slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      return [];
    }
  },

  async getAvailable(facilityId?: number, date?: string): Promise<FrontendSlot[]> {
    try {
      const slots = await slotsController.getAvailableSlots({ facilityId, date });
      return adaptSlots(slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  },
};
