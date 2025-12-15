import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  Facility,
  FacilityCreateRequest,
  FacilityUpdateRequest,
} from '../types';

export const facilitiesController = {
  async getFacilities(params?: { name?: string; campusId?: number; typeId?: number }): Promise<Facility[]> {
    const { data } = await apiClient.get<Facility[]>('/Facilities', { params });
    return data;
  },

  async createFacility(payload: FacilityCreateRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/Facilities', payload);
    return data;
  },

  async updateFacility(id: number, payload: FacilityUpdateRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Facilities/${id}`, payload);
    return data;
  },

  async deleteFacility(id: number): Promise<ApiMessageResponse> {
    const { data } = await apiClient.delete<ApiMessageResponse>(`/Facilities/${id}`);
    return data;
  },
};

export default facilitiesController;
