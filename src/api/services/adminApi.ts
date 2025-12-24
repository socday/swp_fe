import { adaptBookings, adaptFacilities, adaptSlots, type FrontendFacility, type FrontendSlot } from '../apiAdapters';
import bookingsController from '../api/controllers/bookingsController';
import facilitiesController from '../api/controllers/facilitiesController';
import slotsController from '../api/controllers/slotsController';
import usersController from '../api/controllers/usersController';
import type { Booking } from '../api/types';
import { ROLE_ID_MAP } from '../../utils/userRoles';
import { adaptUserData, type UserData } from './common';
import { ensureFacilityTypeId } from './facilityHelpers';

export interface AdvancedAnalytics {
  totalApprovedBookings: number;
  topRooms: { roomName: string; count: number; campus: string }[];
  topSlots: { slot: string; count: number }[];
  topCategories: { category: string; count: number }[];
}

export const adminApi = {
  async getUsers(): Promise<UserData[]> {
    try {
      const response = await usersController.getUsers();
      const items = response?.items ?? [];
      return items.map((item) =>
        adaptUserData({
          ...item,
        })
      );
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  async updateUser(
    id: number,
    payload: { name: string; role: UserData['role'] }
  ): Promise<boolean> {
    try {
      await usersController.updateUser(id, {
        fullName: payload.name,
        isActive: true,
      });

      const roleId = ROLE_ID_MAP[payload.role];
      if (roleId) {
        await usersController.updateRole(id, { newRoleId: roleId });
      }

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  async deactivateUser(id: number, fullName: string): Promise<boolean> {
    try {
      await usersController.updateUser(id, {
        fullName,
        isActive: false,
      });
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  },

  async getAdvancedAnalytics(_period?: string, _campus?: string): Promise<AdvancedAnalytics> {
    try {
      const [bookingData, facilitiesData, slotsData] = await Promise.all([
        bookingsController.getBookings(),
        facilitiesController.getFacilities(),
        slotsController.getSlots(),
      ]);
      console.log('Fetched booking data for analytics:', bookingData);

      const facilities = adaptFacilities(facilitiesData || []);
      const slots = adaptSlots(slotsData || []);
      const bookings = Array.isArray((bookingData as any)?.items)
        ? adaptBookings((bookingData as any).items || [])
        : adaptBookings((bookingData as Booking[]) || []);
        console.log('Fetched bookings for analytics:', bookings);
      const campusFilterId =
        _campus === 'NVH' ? 2 : _campus === 'FU_FPT' ? 1 : undefined;

      const facilityById = new Map<number, FrontendFacility>();
      facilities.forEach((f) => facilityById.set(f.id, f));
      const slotById = new Map<number, FrontendSlot>();
      slots.forEach((s) => slotById.set(s.id, s));

      const approved = bookings.filter((b) => (b.status || '').toLowerCase() === 'approved');
      const filteredBookings = campusFilterId
        ? approved.filter((b) => facilityById.get(b.facilityId)?.campusId === campusFilterId)
        : approved;

      const roomCount = new Map<number, number>();
      filteredBookings.forEach((b) => {
        roomCount.set(b.facilityId, (roomCount.get(b.facilityId) || 0) + 1);
      });
      const topRooms = Array.from(roomCount.entries())
        .map(([facilityId, count]) => {
          const facility = facilityById.get(facilityId);
          return {
            roomName: facility?.name || `Room ${facilityId}`,
            count,
            campus: facility?.campusId === 2 ? 'NVH' : 'FU_FPT',
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const slotCount = new Map<number, number>();
      filteredBookings.forEach((b) => {
        slotCount.set(b.slotId, (slotCount.get(b.slotId) || 0) + 1);
      });
      const topSlots = Array.from(slotCount.entries())
        .map(([slotId, count]) => {
          const slot = slotById.get(slotId);
          const label = slot?.name
            ? slot.name
            : slot?.startTime && slot?.endTime
            ? `${slot.startTime}-${slot.endTime}`
            : `Slot ${slotId}`;
          return { slot: label, count };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const categoryCount = new Map<string, number>();
      filteredBookings.forEach((b) => {
        const facility = facilityById.get(b.facilityId);
        const category = facility?.typeName || 'Unknown';
        categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
      });
      const topCategories = Array.from(categoryCount.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count);

      return {
        totalApprovedBookings: filteredBookings.length,
        topRooms,
        topSlots,
        topCategories,
      };
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
      return {
        totalApprovedBookings: 0,
        topRooms: [],
        topSlots: [],
        topCategories: [],
      };
    }
  },

  async addRoomImage(_roomId: string | number, _imageUrl: string): Promise<boolean> {
    try {
      const id = typeof _roomId === 'string' ? parseInt(_roomId, 10) : _roomId;
      if (Number.isNaN(id)) throw new Error('Invalid room id');
      const facilities = await facilitiesController.getFacilities();
      const target = facilities.find((f) => f.facilityId === id);
      if (!target) throw new Error('Facility not found');

      const typeId = target.typeId || (await ensureFacilityTypeId(target.type?.typeName || 'Classroom'));
      if (!typeId) throw new Error('Unable to resolve facility type');

      await facilitiesController.updateFacility(id, {
        facilityName: target.facilityName,
        campusId: target.campusId,
        typeId,
        imageUrl: _imageUrl,
        status: target.status || 'Active',
      });
      return true;
    } catch (error) {
      console.error('Error adding room image:', error);
      return false;
    }
  },

  async deleteRoomImage(_roomId: string | number, _imageUrl: string): Promise<boolean> {
    try {
      const id = typeof _roomId === 'string' ? parseInt(_roomId, 10) : _roomId;
      if (Number.isNaN(id)) throw new Error('Invalid room id');
      const facilities = await facilitiesController.getFacilities();
      const target = facilities.find((f) => f.facilityId === id);
      if (!target) throw new Error('Facility not found');

      const typeId = target.typeId || (await ensureFacilityTypeId(target.type?.typeName || 'Classroom'));
      if (!typeId) throw new Error('Unable to resolve facility type');

      await facilitiesController.updateFacility(id, {
        facilityName: target.facilityName,
        campusId: target.campusId,
        typeId,
        imageUrl: undefined,
        status: target.status || 'Active',
      });
      return true;
    } catch (error) {
      console.error('Error deleting room image:', error);
      return false;
    }
  },
};
