import facilitiesAssetController from '../api/controllers/facilityAssetController';
import facilitiesController from '../api/controllers/facilitiesController';
import type { FacilityType, FacilityTypeDto, GetFacilityResponse } from '../api/types';
import facilityTypesController from '../api/controllers/facilityTypesController';

export interface FacilityFilters {
  name?: string | undefined;
  typeId?: number | undefined;
  campusId?: number | undefined;
  slotId?: number | undefined;
  date?: string | undefined;
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

  async getAllFacilityTypes(): Promise<FacilityTypeDto[]> {
    try {
      const facilityTypes = await facilityTypesController.getFacilityTypes();
      return facilityTypes;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
  },
};
