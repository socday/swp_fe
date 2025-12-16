import {
  adaptCampuses,
  adaptFacilities,
  adaptSlots,
  adaptBookings,
  adaptReports,
  adaptNotifications,
  toBackendBooking,
  toBackendReport,
  type FrontendCampus,
  type FrontendFacility,
  type FrontendSlot,
  type FrontendBooking,
  type FrontendReport,
  type FrontendNotification,
} from './apiAdapters';
import {
  GetFacilityResponse,
  type Booking,
  type BookingAvailabilityResponse,
  type BookingFilterRequest,
  type BookingRecurringRequest,
  type BookingStatusUpdate,
  type LoginRequest,
  type Report,
  type ReportCreateRequest,
  type ReportStatusUpdate,
  type StaffCancelRequest,
  type User,
  type UserResponse,
} from './api/types';
import authController from './api/controllers/authController';
import bookingsController from './api/controllers/bookingsController';
import campusesController from './api/controllers/campusesController';
import facilitiesController from './api/controllers/facilitiesController';
import notificationsController from './api/controllers/notificationsController';
import reportsController from './api/controllers/reportsController';
import slotsController from './api/controllers/slotsController';
import usersController from './api/controllers/usersController';
import { ROLE_ID_MAP } from '../utils/userRoles';

// ============================================================================
// Helper utilities
// ============================================================================

const mapBackendRole = (
  backendRole: string | undefined
): 'student' | 'lecturer' | 'admin' | 'staff' | 'security' => {
  const roleMap: Record<string, 'student' | 'lecturer' | 'admin' | 'staff' | 'security'> = {
    Student: 'student',
    Lecturer: 'lecturer',
    Admin: 'admin',
    Staff: 'staff',
    Security: 'security',
  };
  return roleMap[backendRole || ''] || 'student';
};

const persistToken = (token?: string): void => {
  if (!token) return;
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

const safeErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: ReturnType<typeof mapBackendRole>;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

type BackendUserLike = Partial<User> & Partial<UserResponse> & {
  role?: string | { roleName?: string };
};

const adaptUserData = (backend: BackendUserLike): UserData => {
  const email = backend.email || '';
  const backendRoleName =
    typeof backend.role === 'string'
      ? backend.role
      : backend.role?.roleName || backend.roleName;

  return {
    id: backend.userId ?? 0,
    name: backend.fullName || '',
    email,
    role: mapBackendRole(backendRoleName),
    status: backend.isActive === false ? 'Inactive' : 'Active',
    createdAt: backend.createdAt || new Date().toISOString(),
  };
};

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async login(
    data: LoginRequest
  ): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
    try {
      const result = await authController.login(data);

      if (!result?.token) {
        return { success: false, error: result?.message || 'Login failed' };
      }

      persistToken(result.token);

      const backendUser: Partial<User> & {
        role?: string | { roleName?: string };
      } =
        result.user ??
        ((result as unknown as Partial<User> & { role?: string }).userId
          ? (result as unknown as Partial<User> & { role?: string })
          : {});

      const mappedUser = backendUser.userId
        ? {
            id: backendUser.userId.toString(),
            name: backendUser.fullName || '',
            email: backendUser.email || data.email,
            role: mapBackendRole(
              typeof backendUser.role === 'string'
                ? backendUser.role
                : backendUser.role?.roleName
            ),
          }
        : undefined;

      return { success: true, user: mappedUser, token: result.token };
    } catch (error) {
      const message = safeErrorMessage(error, 'Failed to login');
      console.error('Error during login:', error);
      return { success: false, error: message };
    }
  },
};

// ============================================================================
// CAMPUSES API
// ============================================================================

export const campusesApi = {
  async getAll(): Promise<FrontendCampus[]> {
    try {
      const data = await campusesController.getCampuses();
      return adaptCampuses(data || []);
    } catch (error) {
      console.error('Error fetching campuses:', error);
      return [];
    }
  },
};

// ============================================================================
// FACILITIES API (Rooms)
// ============================================================================

export const facilitiesApi = {
  async getAll(campusId?: number, typeId?: number): Promise<GetFacilityResponse[]> {
    try {
      const facilities = await facilitiesController.getFacilities({ campusId, typeId });
      console.log('Fetched facilities:', facilities);
      return facilities;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
  },
};

// ============================================================================
// SLOTS API
// ============================================================================

export const slotsApi = {
  async getAll(): Promise<FrontendSlot[]> {
    try {
      const slots = await slotsController.getSlots();
      return adaptSlots(slots || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
      return [];
    }
  },
};

// ============================================================================
// BOOKINGS API
// ============================================================================

export const bookingsApi = {
  async getAll(status?: string): Promise<FrontendBooking[]> {
    try {
      const filters: BookingFilterRequest | undefined = status ? { status } : undefined;
      const data = await bookingsController.getBookings(filters);
      if (Array.isArray((data as any)?.items)) {
        return adaptBookings((data as any).items || []);
      }
      return adaptBookings((data as Booking[]) || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  async getFiltered(filters?: BookingFilterRequest): Promise<FrontendBooking[]> {
    try {
      const data = await bookingsController.getBookings(filters);
      console.log('Raw booking data:', data);
      console.log("ARray", Array.isArray((data as any)?.items));
      if (Array.isArray((data as any)?.items)) {
        return adaptBookings((data as any).items || []);
      }
      return adaptBookings((data as Booking[]) || []);
    } catch (error) {
      console.error('Error fetching filtered bookings:', error);
      return [];
    }
  },

  async create(booking: {
    facilityId: number;
    date: string;
    slotId: number;
    purpose?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const payload = toBackendBooking(booking);
      const response = await bookingsController.createBooking(payload);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: safeErrorMessage(error, 'Failed to create booking') };
    }
  },

  async updateStatus(id: number, statusUpdate: BookingStatusUpdate): Promise<boolean> {
    try {
      await bookingsController.updateStatus(id, statusUpdate);
      return true;
    } catch (error) {
      console.error('Error updating booking status:', error);
      return false;
    }
  },

  async checkAvailability(facilityId: number, date: string): Promise<BookingAvailabilityResponse | null> {
    try {
      return await bookingsController.checkAvailability(facilityId, date);
    } catch (error) {
      console.error('Error checking availability:', error);
      return null;
    }
  },

  async cancel(id: number): Promise<boolean> {
    try {
      await bookingsController.cancelBooking(id);
      return true;
    } catch (error) {
      console.error('Error canceling booking:', error);
      return false;
    }
  },

  async getSecuritySchedule(campusId: number): Promise<FrontendBooking[]> {
    try {
      const data = await bookingsController.getSecuritySchedule(campusId);
      return adaptBookings(data || []);
    } catch (error) {
      console.error('Error fetching security schedule:', error);
      return [];
    }
  },

  async createRecurring(request: BookingRecurringRequest): Promise<unknown> {
    try {
      return await bookingsController.createRecurringBooking(request);
    } catch (error) {
      console.error('Error creating recurring booking:', error);
      throw error;
    }
  },

  async updateRecurringStatus(recurrenceId: string, statusUpdate: BookingStatusUpdate): Promise<boolean> {
    try {
      await bookingsController.updateRecurringStatus(recurrenceId, statusUpdate);
      return true;
    } catch (error) {
      console.error('Error updating recurring booking status:', error);
      return false;
    }
  },

  async staffCancel(id: number, request: StaffCancelRequest): Promise<boolean> {
    try {
      await bookingsController.staffCancelBooking(id, request);
      return true;
    } catch (error) {
      console.error('Error performing staff cancel:', error);
      return false;
    }
  },
};

// ============================================================================
// REPORTS API
// ============================================================================

export const reportsApi = {
  async getAll(status?: string): Promise<FrontendReport[]> {
    try {
      const reports = await reportsController.getReports();
      const filtered = status ? (reports || []).filter((r) => r.status === status) : reports;
      return adaptReports(filtered || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async create(report: ReportCreateRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const payload = toBackendReport(report);
      const response = await reportsController.createReport(payload);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Error creating report:', error);
      return { success: false, error: safeErrorMessage(error, 'Failed to create report') };
    }
  },

  async resolve(id: number, resolution: string): Promise<boolean> {
    try {
      await reportsController.updateStatus(id, { status: 'Resolved' });
      return true;
    } catch (error) {
      console.error('Error resolving report:', error);
      return false;
    }
  },

  async updateStatus(id: number, statusUpdate: ReportStatusUpdate): Promise<boolean> {
    try {
      await reportsController.updateStatus(id, statusUpdate);
      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  },
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsApi = {
  async getAll(): Promise<FrontendNotification[]> {
    try {
      const data = await notificationsController.getNotifications();
      return adaptNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },
};

// ============================================================================
// LEGACY COMPATIBILITY - Map old interfaces to new ones
// ============================================================================

export interface Room {
  id: string;
  name: string;
  campus: 'FU_FPT' | 'NVH';
  building: string;
  floor: number;
  capacity: number;
  category: 'Phòng học' | 'Phòng Lab' | 'Hội trường' | 'Sân thể thao';
  amenities: string[];
  status: 'Active' | 'Maintenance' | 'Inactive';
  images?: string[];
}

const CATEGORY_MAP: Record<string, Room['category']> = {
  'Phòng học': 'Phòng học',
  Classroom: 'Phòng học',
  'Study Room': 'Phòng học',
  'Self-study': 'Phòng học',
  'Phòng Lab': 'Phòng Lab',
  Lab: 'Phòng Lab',
  'Computer Lab': 'Phòng Lab',
  'Hội trường': 'Hội trường',
  'Lecture Hall': 'Hội trường',
  'Meeting Room': 'Hội trường',
  Auditorium: 'Hội trường',
  'Sân thể thao': 'Sân thể thao',
  'Sports Hall': 'Sân thể thao',
  'Sports Field': 'Sân thể thao',
  Gym: 'Sân thể thao',
  Stadium: 'Sân thể thao',
};

const normalizeCategory = (raw?: string): Room['category'] => {
  if (!raw) return 'Phòng học';
  const direct = CATEGORY_MAP[raw];
  if (direct) return direct;
  const trimmed = raw.trim();
  return CATEGORY_MAP[trimmed] || 'Phòng học';
};

export const facilityToRoom = (facility: FrontendFacility): Room => ({
  id: facility.id.toString(),
  name: facility.name,
  campus: facility.campusId === 1 ? 'FU_FPT' : 'NVH',
  building: facility.typeName || 'Unknown',
  floor: 1,
  capacity: facility.capacity,
  category: normalizeCategory(facility.typeName),
  amenities: [],
  status: facility.status as Room['status'],
  images: facility.imageUrl ? [facility.imageUrl] : [],
});

const facilityResponseToRoom = (facility: GetFacilityResponse): Room => {
  const normalizedCampus: Room['campus'] = facility.campusName?.toUpperCase().includes('NVH') ? 'NVH' : 'FU_FPT';

  return {
    id: facility.facilityId?.toString() || '',
    name: facility.facilityName || 'Unnamed Facility',
    campus: normalizedCampus,
    building: facility.typeName || facility.campusName || 'Unknown',
    floor: 1,
    capacity: facility.facilityCapacity || 0,
    category: normalizeCategory(facility.typeName),
    amenities: [],
    status: (facility.status as Room['status']) || 'Inactive',
    images: facility.imageUrl ? [facility.imageUrl] : [],
  };
};

export const roomsApi = {
  async getAll(): Promise<Room[]> {
    const facilities = await facilitiesApi.getAll();
    return facilities.map(facilityResponseToRoom);
  },
  async create(room: Omit<Room, 'id'>): Promise<string | null> {
    console.warn('roomsApi.create() called but not implemented for backend');
    return null;
  },
  async update(id: string, room: Partial<Room>): Promise<boolean> {
    console.warn('roomsApi.update() called but not implemented for backend');
    return false;
  },
  async delete(id: string): Promise<boolean> {
    console.warn('roomsApi.delete() called but not implemented for backend');
    return false;
  },
};

const originalBookingsApi = bookingsApi;

export const legacyBookingsApi = {
  async getAll(): Promise<any[]> {
    const bookings = await originalBookingsApi.getAll();
    return bookings.map((b: any) => ({
      ...b,
      id: b.id?.toString?.() || b.bookingId?.toString?.() || '',
      roomId: b.facilityId?.toString?.() || '',
      userId: b.userId?.toString?.() || '',
    }));
  },
  async getByUser(userId: string): Promise<any[]> {
    const allBookings = await this.getAll();
    return allBookings.filter((b) => b.userId === userId);
  },
  async create(booking: any): Promise<{ success: boolean; id?: string; error?: string }> {
    console.warn('Legacy bookingsApi.create() called. This needs proper implementation.');
    return { success: false, error: 'Not yet implemented for backend' };
  },
  async updateStatus(id: string | number, status: string): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    return originalBookingsApi.updateStatus(numericId, { status });
  },
  async cancel(id: string | number): Promise<boolean> {
    console.warn('bookingsApi.cancel() not in backend spec');
    return false;
  },
  async getSchedule(startDate: string, endDate: string): Promise<any[]> {
    const allBookings = await this.getAll();
    return allBookings.filter((b: any) => {
      const bookingDate = new Date(b.date || b.bookingDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return bookingDate >= start && bookingDate <= end;
    });
  },
};

export const adminApi = {
  async getUsers(): Promise<UserData[]> {
    try {
      const response = await usersController.getUsers();
      const items = response?.items ?? [];
      return items.map((item) =>
        adaptUserData({
          ...item,
          role: { roleName: item.roleName },
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

  async getAdvancedAnalytics(_period?: string, _campus?: string): Promise<any> {
    console.warn('adminApi.getAdvancedAnalytics() not implemented for backend');
    return {
      totalBookings: 0,
      totalUsers: 0,
      totalRooms: 0,
      averageUtilization: 0,
      peakHours: [],
      popularRooms: [],
    };
  },

  async addRoomImage(_roomId: string | number, _imageUrl: string): Promise<boolean> {
    console.warn('adminApi.addRoomImage() not implemented for backend');
    return false;
  },

  async deleteRoomImage(_roomId: string | number, _imageUrl: string): Promise<boolean> {
    console.warn('adminApi.deleteRoomImage() not implemented for backend');
    return false;
  },
};

export const analyticsApi = {
  async getUsageReports(): Promise<any[]> {
    console.warn('analyticsApi.getUsageReports() not implemented for backend');
    return [];
  },
  async exportReport(): Promise<Blob | null> {
    console.warn('analyticsApi.exportReport() not implemented for backend');
    return null;
  },
};

export const staffApi = {
  async getPendingBookings(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll('Pending');
  },
  async getBookingHistory(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll();
  },
  async getSecurityTasks(): Promise<any[]> {
    console.warn('staffApi.getSecurityTasks() not implemented for backend');
    return [];
  },
  async getReports(): Promise<FrontendReport[]> {
    return reportsApi.getAll();
  },
  async createSecurityTask(): Promise<string | null> {
    console.warn('staffApi.createSecurityTask() not implemented for backend');
    return null;
  },
  async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    const numericId = parseInt(bookingId, 10);
    return bookingsApi.updateStatus(numericId, {
      status: 'Cancelled',
      rejectionReason: reason,
    });
  },
  async updateReportStatus(reportId: string, status: string, notes?: string): Promise<boolean> {
    if (status === 'Resolved') {
      const numericId = parseInt(reportId, 10);
      return reportsApi.resolve(numericId, notes || '');
    }
    console.warn('staffApi.updateReportStatus() partially implemented');
    return false;
  },
};

export const securityApi = {
  async getTasks(): Promise<any[]> {
    console.warn('securityApi.getTasks() not implemented for backend');
    return [];
  },
  async getApprovedBookings(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll('Approved');
  },
  async completeTask(): Promise<boolean> {
    console.warn('securityApi.completeTask() not implemented for backend');
    return false;
  },
  async submitReport(report: Omit<Report, 'reportId' | 'userId' | 'status' | 'createdAt'>): Promise<boolean> {
    const result = await reportsApi.create({
      facilityId: report.facilityId || 0,
      title: (report as any).title || 'Security Report',
      description: (report as any).description || '',
      reportType: (report as any).reportType || 'Security',
      bookingId: report.bookingId,
    });
    return result.success;
  },
};

export const initData = async (): Promise<void> => {
  console.warn('initData() called but not needed with real backend. Data should be initialized in backend database.');
};

export * from './api/types';
