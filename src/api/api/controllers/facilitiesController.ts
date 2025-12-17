import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  FacilityCreateRequest,
  FacilityUpdateRequest,
  GetFacilityResponse,
} from '../types';

export const facilitiesController = {
  async getFacilities(params?: { name?: string; campusId?: number; typeId?: number; slotId?: number; date?: string }): Promise<GetFacilityResponse[]> {
    const { data } = await apiClient.get<GetFacilityResponse[]>('/Facilities', { params });
    console.log('Fetched facilities 1:', data);
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
