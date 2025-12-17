import { apiClient } from '../../httpClient';
import type { ApiMessageResponse, FacilityAsset, UpdateConditionRequest } from '../types';

export const facilityAssetController = {
  async getAssetsByFacility(facilityId: number): Promise<FacilityAsset[]> {
    const { data } = await apiClient.get<FacilityAsset[]>(`/FacilityAsset/facility/${facilityId}`);
    return data;
  },

  async updateCondition(payload: UpdateConditionRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>('/FacilityAsset/update-condition', payload);
    return data;
  },

  async createFacilityAsset(payload: { facilityId: number; assetId: number; quantity?: number; condition?: string }): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/FacilityAsset', payload);
    return data;
  },

  async deleteFacilityAsset(id: number): Promise<ApiMessageResponse> {
    const { data } = await apiClient.delete<ApiMessageResponse>(`/FacilityAsset/${id}`);
    return data;
  },
};

export default facilityAssetController;
