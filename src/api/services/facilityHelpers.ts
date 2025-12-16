import facilityTypesController from '../api/controllers/facilityTypesController';
import type { FacilityTypeDto } from '../api/types';

export const ensureFacilityTypeId = async (typeName: string): Promise<number | null> => {
  try {
    const types = await facilityTypesController.getFacilityTypes();
    const existing = types.find((t) => t.typeName.toLowerCase() === typeName.toLowerCase());
    if (existing?.typeId) return existing.typeId;

    await facilityTypesController.createFacilityType({ typeName } as FacilityTypeDto);
    const refreshed = await facilityTypesController.getFacilityTypes();
    const created = refreshed.find((t) => t.typeName.toLowerCase() === typeName.toLowerCase());
    return created?.typeId ?? null;
  } catch (error) {
    console.error('Error ensuring facility type:', error);
    return null;
  }
};
