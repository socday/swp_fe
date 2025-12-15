import { apiClient } from '../../httpClient';
import type { Slot } from '../types';

export const slotsController = {
  async getSlots(): Promise<Slot[]> {
    const { data } = await apiClient.get<Slot[]>('/Slots');
    return data;
  },
};

export default slotsController;
