// Shared backend model and DTO definitions used across controller clients

// ============================================================================
// Core entities returned by the backend
// ============================================================================

export interface Campus {
  campusId: number;
  campusName: string;
  address?: string;
  isActive: boolean;
}

export interface FacilityType {
  typeId: number;
  typeName: string;
  requiresApproval?: boolean;
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
  capacity?: number;
  status: string;
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
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Role {
  roleId: number;
  roleName: string;
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
  bookingDate: string;
  slotId: number;
  purpose?: string;
  bookingType?: string;
  status: string;
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
  status: string;
  reportType: string;
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

export interface SecurityTask {
  securityTaskId?: number;
  title: string;
  description?: string;
  priority?: string;
  assignedToUserId?: number;
  createdBy?: number;
  status: string;
  reportNote?: string;
  createdAt?: string;
  completedAt?: string;
}

// ============================================================================
// DTOs and helper contracts
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message?: string;
  user?: User;
}

export interface BookingCreateRequest {
  facilityId: number;
  bookingDate: string;
  slotId: number;
  purpose?: string;
}

export interface BookingStatusUpdate {
  status: string;
  rejectionReason?: string;
}

export interface BookingRecurringRequest {
  facilityId: number;
  slotId: number;
  purpose?: string;
  startDate: string;
  endDate: string;
  daysOfWeek: number[];
}

export interface BookingFilterRequest {
  fromDate?: string;
  toDate?: string;
  userId?: number;
  facilityId?: number;
  campusId?: number;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface StaffCancelRequest {
  staffId: number;
  reason: string;
}

export interface CampusDto {
  campusId?: number;
  campusName: string;
  address?: string;
  isActive?: boolean;
}

export interface FacilityCreateRequest {
  facilityName: string;
  campusId: number;
  typeId: number;
  imageUrl?: string;
  status?: string;
}

export interface FacilityUpdateRequest {
  facilityName: string;
  campusId: number;
  typeId: number;
  imageUrl?: string;
  status: string;
}

export interface FacilityTypeDto {
  typeId?: number;
  typeName: string;
}

export interface ReportCreateRequest {
  bookingId?: number;
  facilityId: number;
  title: string;
  description: string;
  reportType: string;
}

export interface ReportStatusUpdate {
  status: string;
}

export interface CreateNotiRequest {
  userId: number;
  title: string;
  message: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  assignedToId?: number;
}

export interface CompleteTaskRequest {
  reportNote?: string;
}

export interface UpdateConditionRequest {
  id: number;
  condition: string;
  quantity?: number;
}

export interface UserFilterRequest {
  keyword?: string;
  roleId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  roleId: number;
}

export interface UpdateUserRequest {
  fullName: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface UpdateRoleRequest {
  newRoleId: number;
}

export interface UserResponse {
  userId: number;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
}

export interface BookingAvailabilityResponse {
  facilityId: number;
  date: string;
  bookedSlotIds: number[];
}

export interface DashboardStatsResponse {
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  totalReports: number;
  pendingReports: number;
  topFacilities: TopFacilityDto[];
  bookingInMonths: MonthlyBookingDto[];
}

export interface TopFacilityDto {
  facilityName: string;
  bookingCount: number;
}

export interface MonthlyBookingDto {
  month: string;
  count: number;
}

export interface ApiMessageResponse {
  message: string;
  [key: string]: unknown;
}

export interface PagedResult<T> {
  items: T[];
  totalRecords: number;
  pageIndex: number;
  pageSize: number;
}
