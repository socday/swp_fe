import { apiClient } from '../../httpClient';
import type { ApiMessageResponse, FacilityTypeDto } from '../types';

export const facilityTypesController = {
  async getFacilityTypes(): Promise<FacilityTypeDto[]> {
    const { data } = await apiClient.get<FacilityTypeDto[]>('/facility-types');
    return data;
  },

  async createFacilityType(payload: FacilityTypeDto): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/facility-types', payload);
    return data;
  },

  async deleteFacilityType(id: number): Promise<ApiMessageResponse> {
    const { data } = await apiClient.delete<ApiMessageResponse>(`/facility-types/${id}`);
    return data;
  },
};

export default facilityTypesController;
