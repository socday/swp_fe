import { buildApiUrl, getApiHeaders } from '../utils/config';
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

// Helper function to handle API responses
const handleResponse = async <T,>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// ============================================================================
// INTERFACES - Matching Backend Schema
// ============================================================================

export interface Campus {
  campusId: number;
  campusName: string;
  address: string;
  isActive: boolean;
  facilities?: Facility[];
}

export interface FacilityType {
  typeId: number;
  typeName: string;
  requiresApproval: boolean;
  description?: string;
}

export interface Asset {
  assetId: number;
  assetName: string;
  assetType: string;
  description?: string;
}

export interface FacilityAsset {
  id: number;
  facilityId: number;
  assetId: number;
  quantity?: number;
  condition?: string;
  asset?: Asset;
}

export interface Facility {
  facilityId: number;
  facilityName: string;
  campusId: number;
  typeId: number;
  capacity: number;
  status: string; // "Active" | "Maintenance" | "Inactive"
  imageUrl?: string;
  description?: string;
  createdAt?: string;
  campus?: Campus;
  type?: FacilityType;
  facilityAssets?: FacilityAsset[];
}

export interface Slot {
  slotId: number;
  slotName: string;
  startTime: string; // TimeSpan format từ backend
  endTime: string;
  isActive: boolean;
}

export interface Role {
  roleId: number;
  roleName: string; // "Student", "Lecturer", "Staff", "Security", "Admin"
  description?: string;
}

export interface User {
  userId: number;
  email: string;
  passwordHash?: string;
  fullName: string;
  roleId: number;
  phoneNumber?: string;
  isActive: boolean;
  createdAt?: string;
  role?: Role;
}

export interface Booking {
  bookingId: number;
  userId: number;
  facilityId: number;
  bookingDate: string; // Date format
  slotId: number;
  purpose?: string;
  bookingType?: string; // "Regular" | "Semester"
  status: string; // "Pending" | "Approved" | "Rejected" | "Cancelled"
  priorityLevel?: string;
  approverId?: number;
  rejectionReason?: string;
  approvedAt?: string;
  recurrenceGroupId?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: User;
  facility?: Facility;
  slot?: Slot;
  approver?: User;
}

export interface Report {
  reportId: number;
  userId: number;
  facilityId?: number;
  bookingId?: number;
  title: string;
  description: string;
  status: string; // "Pending" | "Resolved"
  reportType: string; // "Damage" | "Maintenance" | "Cleanliness" | "Equipment"
  createdAt?: string;
  resolvedAt?: string;
  user?: User;
  facility?: Facility;
  booking?: Booking;
}

export interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt?: string;
  user?: User;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user: User;
  message?: string;
}

export interface BookingCreateRequest {
  facilityId: number;
  bookingDate: string; // "YYYY-MM-DD"
  slotId: number;
  purpose?: string;
}

export interface BookingStatusUpdate {
  status: string;
  rejectionReason?: string;
}

export interface ReportCreateRequest {
  bookingId?: number;
  facilityId: number;
  title: string;
  description: string;
  reportType: string;
}

// Helper function to map backend role to frontend role
const mapBackendRole = (backendRole: string): 'student' | 'lecturer' | 'admin' | 'staff' | 'security' => {
  const roleMap: Record<string, any> = {
    'Student': 'student',
    'Lecturer': 'lecturer',
    'Admin': 'admin',
    'Staff': 'staff',
    'Security': 'security',
  };
  return roleMap[backendRole] || 'student';
};

// ============================================================================
// AUTH API
// ============================================================================

export const authApi = {
  async login(data: LoginRequest): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
    try {
      const response = await fetch(buildApiUrl('/Auth/login'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        return { success: false, error: errorData.message || 'Login failed' };
      }
      
      const result = await response.json();
      
      // Map backend response to App.tsx User format
      const mappedUser = {
        id: result.userId.toString(),           // Convert number to string
        name: result.fullName,                  // Map fullName to name
        email: result.email,
        role: mapBackendRole(result.role),      // Convert "Student" to "student"
        campus: 'FU_FPT' as const,              // Default campus (can be enhanced later)
      };
      
      // Store token if provided
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }
      
      return { success: true, user: mappedUser, token: result.token };
    } catch (error) {
      console.error('Error during login:', error);
      return { success: false, error: 'Failed to login' };
    }
  },
};

// ============================================================================
// CAMPUSES API
// ============================================================================

export const campusesApi = {
  async getAll(): Promise<FrontendCampus[]> {
    try {
      const response = await fetch(buildApiUrl('/Campuses'), { headers: getApiHeaders() });
      const data = await handleResponse<Campus[]>(response);
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
  async getAll(campusId?: number, typeId?: number): Promise<FrontendFacility[]> {
    try {
      const params = new URLSearchParams();
      if (campusId) params.append('campusId', campusId.toString());
      if (typeId) params.append('typeId', typeId.toString());
      
      const url = params.toString() 
        ? buildApiUrl(`/Facilities?${params}`)
        : buildApiUrl('/Facilities');
        
      const response = await fetch(url, { headers: getApiHeaders() });
      const data = await handleResponse<Facility[]>(response);
      return adaptFacilities(data || []);
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
      const response = await fetch(buildApiUrl('/Slots'), { headers: getApiHeaders() });
      const data = await handleResponse<Slot[]>(response);
      return adaptSlots(data || []);
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
      const params = status ? `?status=${status}` : '';
      const response = await fetch(buildApiUrl(`/Bookings${params}`), { headers: getApiHeaders() });
      const data = await handleResponse<Booking[]>(response);
      return adaptBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  async create(booking: { facilityId: number; date: string; slotId: number; purpose?: string }): Promise<{ success: boolean; bookingId?: number; error?: string }> {
    try {
      const response = await fetch(buildApiUrl('/Bookings'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(toBackendBooking(booking)),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create booking' }));
        return { success: false, error: errorData.message || 'Failed to create booking' };
      }
      
      const data = await response.json();
      return { success: true, bookingId: data.bookingId };
    } catch (error) {
      console.error('Error creating booking:', error);
      return { success: false, error: 'Failed to create booking' };
    }
  },

  async updateStatus(id: number, statusUpdate: BookingStatusUpdate): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(`/Bookings/${id}/status`), {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(statusUpdate),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating booking status:', error);
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
      const params = status ? `?status=${status}` : '';
      const response = await fetch(buildApiUrl(`/Reports${params}`), { headers: getApiHeaders() });
      const data = await handleResponse<Report[]>(response);
      return adaptReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async create(report: { facilityId: number; title: string; description: string; reportType: string; bookingId?: number }): Promise<{ success: boolean; reportId?: number; error?: string }> {
    try {
      const response = await fetch(buildApiUrl('/Reports'), {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify(toBackendReport(report)),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create report' }));
        return { success: false, error: errorData.message || 'Failed to create report' };
      }
      
      const data = await response.json();
      return { success: true, reportId: data.reportId };
    } catch (error) {
      console.error('Error creating report:', error);
      return { success: false, error: 'Failed to create report' };
    }
  },

  async resolve(id: number, resolution: string): Promise<boolean> {
    try {
      const response = await fetch(buildApiUrl(`/Reports/${id}/resolve`), {
        method: 'PUT',
        headers: getApiHeaders(),
        body: JSON.stringify(resolution),
      });
      return response.ok;
    } catch (error) {
      console.error('Error resolving report:', error);
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
      const response = await fetch(buildApiUrl('/Notifications'), { headers: getApiHeaders() });
      const data = await handleResponse<Notification[]>(response);
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

// Legacy Room interface mapped to Facility
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

// Helper để convert Facility sang Room format (cho backward compatibility)
export const facilityToRoom = (facility: FrontendFacility): Room => {
  return {
    id: facility.id.toString(),
    name: facility.name,
    campus: facility.campusId === 1 ? 'FU_FPT' : 'NVH', // Giả sử campusId 1 = FU_FPT, 2 = NVH
    building: facility.typeName || 'Unknown',
    floor: 1, // Backend không có floor, default = 1
    capacity: facility.capacity,
    category: (facility.typeName as any) || 'Classroom',
    amenities: [], // Backend facility assets không có trong FrontendFacility
    status: facility.status as any,
    images: facility.imageUrl ? [facility.imageUrl] : [],
  };
};

// Legacy rooms API (sử dụng facilities API internally)
export const roomsApi = {
  async getAll(): Promise<Room[]> {
    const facilities = await facilitiesApi.getAll();
    return facilities.map(facilityToRoom);
  },
  
  // Legacy methods that frontend might call (stub implementations)
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

// Legacy bookings API wrapper with type conversion
const originalBookingsApi = bookingsApi;

// Override bookingsApi to accept both string and number IDs for backward compatibility
export const legacyBookingsApi = {
  async getAll(): Promise<any[]> {
    const bookings = await originalBookingsApi.getAll();
    // Convert to legacy format if needed
    return bookings.map(b => ({
      ...b,
      id: b.bookingId.toString(),
      roomId: b.facilityId.toString(),
      userId: b.userId.toString(),
    }));
  },
  
  async getByUser(userId: string): Promise<any[]> {
    // Note: Backend doesn't have this endpoint in the OpenAPI spec
    const allBookings = await this.getAll();
    return allBookings.filter(b => b.userId === userId);
  },
  
  async create(booking: any): Promise<{ success: boolean; id?: string; error?: string }> {
    console.warn('Legacy bookingsApi.create() called. This needs proper implementation.');
    return { success: false, error: 'Not yet implemented for backend' };
  },
  
  async updateStatus(id: string | number, status: string): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return originalBookingsApi.updateStatus(numericId, { status });
  },
  
  async cancel(id: string | number): Promise<boolean> {
    console.warn('bookingsApi.cancel() not in backend spec');
    return false;
  },
  
  async getSchedule(startDate: string, endDate: string, campus?: string): Promise<any[]> {
    const allBookings = await this.getAll();
    // Filter by date range
    return allBookings.filter(b => {
      const bookingDate = new Date(b.date || b.bookingDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return bookingDate >= start && bookingDate <= end;
    });
  },
};

// Export all for convenience
export {
  handleResponse,
};

// ============================================================================
// ADMIN API (Legacy - Not in backend spec)
// ============================================================================

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin' | 'staff' | 'security';
  campus: 'FU_FPT' | 'NVH';
  isActive: boolean;
}

export interface AdvancedAnalytics {
  totalBookings: number;
  totalUsers: number;
  totalRooms: number;
  averageUtilization: number;
  peakHours: Array<{ hour: number; count: number }>;
  popularRooms: Array<{ roomId: string; roomName: string; count: number }>;
}

export const adminApi = {
  async getAllUsers(): Promise<UserData[]> {
    console.warn('adminApi.getAllUsers() not implemented for backend');
    return [];
  },
  
  async createUser(user: Omit<UserData, 'id'>): Promise<string | null> {
    console.warn('adminApi.createUser() not implemented for backend');
    return null;
  },
  
  async updateUser(id: string, user: Partial<UserData>): Promise<boolean> {
    console.warn('adminApi.updateUser() not implemented for backend');
    return false;
  },
  
  async deleteUser(id: string): Promise<boolean> {
    console.warn('adminApi.deleteUser() not implemented for backend');
    return false;
  },
  
  async deactivateUser(id: string): Promise<boolean> {
    console.warn('adminApi.deactivateUser() not implemented for backend');
    return false;
  },
  
  async getAdvancedAnalytics(): Promise<AdvancedAnalytics> {
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
  
  async uploadRoomImage(roomId: string, image: File): Promise<string | null> {
    console.warn('adminApi.uploadRoomImage() not implemented for backend');
    return null;
  },
  
  async deleteRoomImage(roomId: string, imageUrl: string): Promise<boolean> {
    console.warn('adminApi.deleteRoomImage() not implemented for backend');
    return false;
  },
};

// ============================================================================
// ANALYTICS API (Legacy - Not in backend spec)
// ============================================================================

export interface UsageReport {
  period: string;
  totalBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  utilizationRate: number;
}

export const analyticsApi = {
  async getUsageReports(startDate: string, endDate: string): Promise<UsageReport[]> {
    console.warn('analyticsApi.getUsageReports() not implemented for backend');
    return [];
  },
  
  async exportReport(type: string): Promise<Blob | null> {
    console.warn('analyticsApi.exportReport() not implemented for backend');
    return null;
  },
};

// ============================================================================
// STAFF API (Legacy - Not in backend spec)
// ============================================================================

export interface SecurityTask {
  id: string;
  bookingId: string;
  roomName: string;
  campus: string;
  date: string;
  timeSlot: string;
  status: 'Pending' | 'Completed';
  assignedTo?: string;
  notes?: string;
}

export const staffApi = {
  async getPendingBookings(): Promise<FrontendBooking[]> {
    // Use real bookings API
    return bookingsApi.getAll('Pending');
  },
  
  async getBookingHistory(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll();
  },
  
  async getSecurityTasks(): Promise<SecurityTask[]> {
    console.warn('staffApi.getSecurityTasks() not implemented for backend');
    return [];
  },
  
  async getReports(): Promise<FrontendReport[]> {
    return reportsApi.getAll();
  },
  
  async createSecurityTask(task: Omit<SecurityTask, 'id' | 'status'>): Promise<string | null> {
    console.warn('staffApi.createSecurityTask() not implemented for backend');
    return null;
  },
  
  async cancelBooking(bookingId: string, reason: string): Promise<boolean> {
    const numericId = parseInt(bookingId);
    return bookingsApi.updateStatus(numericId, { 
      status: 'Cancelled', 
      rejectionReason: reason 
    });
  },
  
  async updateReportStatus(reportId: string, status: string, notes?: string): Promise<boolean> {
    if (status === 'Resolved') {
      const numericId = parseInt(reportId);
      return reportsApi.resolve(numericId, notes || '');
    }
    console.warn('staffApi.updateReportStatus() partially implemented');
    return false;
  },
};

// ============================================================================
// SECURITY API (Legacy - Not in backend spec)
// ============================================================================

export const securityApi = {
  async getTasks(): Promise<SecurityTask[]> {
    console.warn('securityApi.getTasks() not implemented for backend');
    return [];
  },
  
  async getApprovedBookings(): Promise<FrontendBooking[]> {
    return bookingsApi.getAll('Approved');
  },
  
  async completeTask(taskId: string, notes: string): Promise<boolean> {
    console.warn('securityApi.completeTask() not implemented for backend');
    return false;
  },
  
  async submitReport(report: Omit<Report, 'reportId' | 'userId' | 'status' | 'createdAt'>): Promise<boolean> {
    // Map to backend format
    const result = await reportsApi.create({
      facilityId: parseInt((report as any).roomId || '0'),
      title: (report as any).title || 'Security Report',
      description: (report as any).description || '',
      reportType: (report as any).type || 'Security',
    });
    return result.success;
  },
};

// ============================================================================
// DATA INITIALIZATION (Legacy - Not needed with real backend)
// ============================================================================

export const initData = async (): Promise<void> => {
  console.warn('initData() called but not needed with real backend. Data should be initialized in backend database.');
  // No-op: Backend should already have data initialized
  return Promise.resolve();
};