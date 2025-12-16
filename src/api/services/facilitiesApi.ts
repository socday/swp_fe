import facilitiesAssetController from '../api/controllers/facilityAssetController';
import facilitiesController from '../api/controllers/facilitiesController';
import type { GetFacilityResponse } from '../api/types';

export interface FacilityFilters {
  name?: string;
  typeId?: number;
  campusId?: number;
  slotId?: number;
  date?: string;
}

export const facilitiesApi = {
  async getAll(filters?: FacilityFilters): Promise<GetFacilityResponse[]> {
    try {
      const params = filters;
      const facilities = await facilitiesController.getFacilities(params);
      for (const facility of facilities) {
        const facilityId = facility.facilityId;
        const amenities = await facilitiesAssetController.getAssetsByFacility(facilityId);
        facility.facilityAssets = amenities;
      }
      console.log('Fetched facilities:', facilities);
      return facilities;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
  },
};
