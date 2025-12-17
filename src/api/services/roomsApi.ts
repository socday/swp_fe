import { facilitiesApi, type FacilityFilters } from './facilitiesApi';
import { ensureFacilityTypeId } from './facilityHelpers';
import { type FrontendFacility } from '../apiAdapters';
import facilitiesController from '../api/controllers/facilitiesController';
import type {
  Facility,
  FacilityCreateRequest,
  GetFacilityResponse,
} from '../api/types';

export interface Room {
  id: string;
  name: string;
  campus: 'FU_FPT' | 'NVH';
  building: string;
  floor: number;
  capacity: number;
  category: 'Classroom' | 'Lab' | 'Meeting Room' | 'Lecture Hall' | 'Study Room';
  amenities: string[];
  status: 'Active' | 'Maintenance' | 'Inactive';
  images?: string[];
}

const CATEGORY_MAP: Record<string, Room['category']> = {
  'Phòng học': 'Classroom',
  Classroom: 'Classroom',
  'Study Room': 'Study Room',
  'Self-study': 'Study Room',
  'Phòng Lab': 'Lab',
  Lab: 'Lab',
  'Computer Lab': 'Lab',
  'Hội trường': 'Lecture Hall',
  'Lecture Hall': 'Lecture Hall',
  'Meeting Room': 'Meeting Room',
  Auditorium: 'Lecture Hall',
  'Sân thể thao': 'Meeting Room',
  'Sports Hall': 'Meeting Room',
  'Sports Field': 'Meeting Room',
  Gym: 'Meeting Room',
  Stadium: 'Meeting Room',
};

const normalizeCategory = (raw?: string): Room['category'] => {
  if (!raw) return 'Classroom';
  const trimmed = raw.trim();
  return CATEGORY_MAP[trimmed] || 'Classroom';
};
const mapRoomStatusToFacilityStatus = (
  status: Room['status']
): string => {
  switch (status) {
    case 'Active':
      return 'Available';        
    case 'Maintenance':
      return 'Maintenance';     
    case 'Inactive':
    default:
      return 'Unavailable';   
  }
};

const normalizeStatus = (raw?: string): Room['status'] => {
  if (!raw) return 'Inactive';
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'active' || normalized === 'available') {
    return 'Active';
  }
  if (normalized.includes('maint')) {
    return 'Maintenance';
  }
  return 'Inactive';
};

const campusNameFromId = (campusId?: number): Room['campus'] =>
  campusId === 2 ? 'NVH' : 'FU_FPT';

const campusIdFromName = (campus?: Room['campus']): number => (campus === 'NVH' ? 2 : 1);

export const facilityToRoom = (facility: FrontendFacility): Room => ({
  id: facility.id.toString(),
  name: facility.name,
  campus: campusNameFromId(facility.id),
  building: facility.typeName || 'Unknown',
  floor: 1,
  capacity: facility.capacity,
  category: normalizeCategory(facility.typeName),
  amenities: [],
  status: normalizeStatus(facility.status),
  images: facility.imageUrl ? [facility.imageUrl] : [],
});

const facilityResponseToRoom = (facility: GetFacilityResponse): Room => {
  const amenities: string[] = [];
  for (const asset of facility.facilityAssets || []) {
    if (asset.asset?.assetName) {
      const quantity = typeof asset.quantity === 'number' ? asset.quantity : 'N/A';
      amenities.push(`(${asset.asset.assetName}, ${quantity})`);
    }
  }

  return {
    id: facility.facilityId.toString(),
    name: facility.facilityName,
    campus: facility.campusName?.toUpperCase().includes('NVH') ? 'NVH' : 'FU_FPT',
    building: facility.typeName || facility.campusName || 'Unknown',
    floor: 1,
    capacity: facility.facilityCapacity || 0,
    category: normalizeCategory(facility.typeName),
    amenities,
    status: normalizeStatus(facility.status),
    images: facility.imageUrl ? [facility.imageUrl] : [],
  };
};

const toFacilityPayload = async (
  room: Omit<Room, 'id'> & { id?: string },
  overrideImageUrl?: string | null
): Promise<FacilityCreateRequest & { status: string }> => {
  const typeId = await ensureFacilityTypeId(room.category);
  if (!typeId) {
    throw new Error('Unable to resolve facility type');
  }

  return {
    facilityName: room.name,
    campusId: campusIdFromName(room.campus),
    typeId,
    capacity: room.capacity ?? 0,
    imageUrl: overrideImageUrl ?? room.images?.[0],
      status: mapRoomStatusToFacilityStatus(room.status),
  };
};  

export const roomsApi = {
  async getAll(filters?: FacilityFilters): Promise<Room[]> {
    const facilities = await facilitiesApi.getAll(filters);
    return facilities.map(facilityResponseToRoom);
  },

  async create(room: Omit<Room, 'id'>): Promise<string | null> {
    try {
      const payload = await toFacilityPayload(room);
      await facilitiesController.createFacility(payload);
      return 'success';
    } catch (error) {
      console.error('Error creating room:', error);
      return null;
    }
  },

  async update(id: string, room: Partial<Room>): Promise<boolean> {
    try {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) throw new Error('Invalid room id');
      if (!room.name || !room.category || !room.status) {
        throw new Error('Missing required room fields for update');
      }
      const payload = await toFacilityPayload(room as Room);
      await facilitiesController.updateFacility(numericId, payload);
      return true;
    } catch (error) {
      console.error('Error updating room:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const numericId = parseInt(id, 10);
      if (Number.isNaN(numericId)) throw new Error('Invalid room id');
      await facilitiesController.deleteFacility(numericId);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  },
};
