import { apiClient } from '../../httpClient';
import type { Asset } from '../types';

export const assetsController = {
  async getAll(): Promise<Asset[]> {
    const { data } = await apiClient.get<Asset[]>('/Asset');
    return data || [];
  },

  async getById(id: number): Promise<Asset> {
    const { data } = await apiClient.get<Asset>(`/Asset/${id}`);
    return data;
  },

  async create(payload: { assetName: string; assetType?: string; description?: string }) {
    const { data } = await apiClient.post('/Asset', payload);
    return data;
  },

  async delete(id: number) {
    const { data } = await apiClient.delete(`/Asset/${id}`);
    return data;
  },
};

export default assetsController;
