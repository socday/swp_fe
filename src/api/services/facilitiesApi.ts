import facilitiesAssetController from '../api/controllers/facilityAssetController';
import facilitiesController from '../api/controllers/facilitiesController';
import type { GetFacilityResponse } from '../api/types';

export const facilitiesApi = {
  async getAll(campusId?: number, typeId?: number): Promise<GetFacilityResponse[]> {
    try {
      const facilities = await facilitiesController.getFacilities({ campusId, typeId });
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
