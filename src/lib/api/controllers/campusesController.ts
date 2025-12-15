import { apiClient } from '../../httpClient';
import type { ApiMessageResponse, Campus, CampusDto } from '../types';

export const campusesController = {
  async getCampuses(): Promise<Campus[]> {
    const { data } = await apiClient.get<Campus[]>('/Campuses');
    return data;
  },

  async getCampusById(id: number): Promise<Campus> {
    const { data } = await apiClient.get<Campus>(`/Campuses/${id}`);
    return data;
  },

  async createCampus(payload: CampusDto): Promise<ApiMessageResponse & { data?: Campus }> {
    const { data } = await apiClient.post<ApiMessageResponse & { data?: Campus }>('/Campuses', payload);
    return data;
  },

  async updateCampus(id: number, payload: CampusDto): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Campuses/${id}`, payload);
    return data;
  },

  async deleteCampus(id: number): Promise<ApiMessageResponse> {
    const { data } = await apiClient.delete<ApiMessageResponse>(`/Campuses/${id}`);
    return data;
  },
};

export default campusesController;
