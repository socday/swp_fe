/**
 * API Adapters - Map Backend Responses to Frontend Format
 * 
 * Backend uses: campusId, facilityId, userId, etc.
 * Frontend uses: id, name (for consistency)
 * 
 * This file ensures all API responses are transformed to match frontend expectations
 */
import { REPORT_TYPES } from './api/types/reportTypes';
import type { Campus, Facility, Slot, Booking, Report, Notification, GetBookingRepsonse, GetFacilityResponse } from './api/types';

// ============================================================================
// FRONTEND INTERFACES (What components expect)
// ============================================================================

export interface FrontendCampus {
  id: number;
  name: string;
  address?: string;
  isActive: boolean;
}

export interface FrontendFacility {
  id: number;
  name: string;
  capacity: number;
  status: string;
  imageUrl?: string;
  description?: string;
  typeName?: string;
}

export interface FrontendSlot {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface FrontendBooking {
  id: number;
  userId: number;
  facilityId: number;
  date: string;
  slotId: number;
  purpose?: string;
  bookingType?: string;
  status: string;
  rejectionReason?: string; 
  // Populated fields
  userName?: string;
  facilityName?: string;
  slotName?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface FrontendReport {
  reportId: number;
  title: string;
  description: string;
  reportType: ReportType;
  status: string;
  createdAt: string; // Required based on your JSON
  createdBy: string; // Mapped from your email field
  facilityName: string;
  
  // Optional/Nullable fields based on previous structure
  facilityId?: number;
  bookingId?: number;
  resolvedAt?: string;
}

export interface FrontendNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt?: string;
}

// ============================================================================
// ADAPTER FUNCTIONS
// ============================================================================

/**
 * Map Campus from backend to frontend format
 */
export function adaptCampus(backend: Campus): FrontendCampus {
  return {
    id: backend.campusId,
    name: backend.campusName,
    address: backend.address,
    isActive: backend.isActive,
  };
}

/**
 * Map Facility from backend to frontend format
 */
export function adaptFacility(backend: Facility): FrontendFacility {
  return {
    id: backend.facilityId,
    name: backend.facilityName,
    campusId: backend.campusId,
    typeId: backend.typeId,
    capacity: backend.capacity,
    status: backend.status,
    imageUrl: backend.imageUrl,
    description: backend.description,
    campus: backend.campus ? adaptCampus(backend.campus) : undefined,
    typeName: backend.type?.typeName,
  };
}

/**
 * Map Slot from backend to frontend format
 */
export function adaptSlot(backend: Slot): FrontendSlot {
  return {
    id: backend.slotId,
    name: backend.slotName,
    startTime: backend.startTime,
    endTime: backend.endTime,
    isActive: backend.isActive,
  };
}

/**
 * Map Booking from backend to frontend format
 */
export function adaptBooking(backend: GetBookingRepsonse): FrontendBooking {
  return {
    id: backend.bookingId,
    userId: backend.userId,
    facilityId: backend.facilityId,
    facilityName: backend.facilityName,
    startTime: backend.startTime,
    endTime: backend.endTime,
    date: backend.bookingDate,
    slotId: backend.slotId,
    purpose: backend.purpose,
    status: backend.status,
    rejectionReason: backend.rejectionReason,
    userName: backend.bookedBy,
  };
}

/**
 * Map Report from backend to frontend format
 */
export function adaptReport(backend: Report): FrontendReport {
  return {
   reportId: backend.reportId,
    title: backend.title,
    description: backend.description,
    reportType: backend.reportType,
    status: backend.status,
    createdAt: backend.createdAt,
    createdBy: backend.user?.fullName ?? '',
    facilityName: backend.facility?.facilityName ?? '',
    facilityId: backend.facilityId,
    bookingId: backend.bookingId,
    resolvedAt: backend.resolvedAt,
  };
}

/**
 * Map Notification from backend to frontend format
 */
export function adaptNotification(backend: Notification): FrontendNotification {
  return {
    id: backend.notificationId,
    userId: backend.userId,
    title: backend.title,
    message: backend.message,
    isRead: backend.isRead,
    type: backend.type,
    createdAt: backend.createdAt,
  };
}

/**
 * Map array of entities
 */
export function adaptCampuses(backends: Campus[]): FrontendCampus[] {
  return backends.map(adaptCampus);
}

export function adaptFacilities(backends: GetFacilityResponse[]): FrontendFacility[] {
  return backends.map(adaptFacility);
}

export function adaptSlots(backends: Slot[]): FrontendSlot[] {
  return backends.map(adaptSlot);
}

export function adaptBookings(backends: Booking[]): FrontendBooking[] {
  console.log('Adapting bookings:', backends);
  console.log('Adapting bookings map:', backends.map(adaptBooking));
  return backends.map(adaptBooking);
}

export function adaptReports(backends: Report[]): FrontendReport[] {
  return backends.map(adaptReport);
}

export function adaptNotifications(backends: Notification[]): FrontendNotification[] {
  return backends.map(adaptNotification);
}

// ============================================================================
// REVERSE ADAPTERS (Frontend → Backend for POST/PUT requests)
// ============================================================================

/**
 * Convert frontend booking data to backend format for POST
 */
export function toBackendBooking(frontend: {
  facilityId: number;
  date: string;
  slotId: number;
  purpose?: string;
}) {
  return {
    facilityId: frontend.facilityId,
    bookingDate: frontend.date,
    slotId: frontend.slotId,
    purpose: frontend.purpose,
  };
}

/**
 * Convert frontend report data to backend format for POST
 */
export function toBackendReport(frontend: {
  facilityId: number;
  title: string;
  description: string;
  reportType: string; 
  bookingId?: number;
}) {
  return {
    facilityId: frontend.facilityId,
    title: frontend.title,
    description: frontend.description,
    reportType: frontend.reportType,
    bookingId: frontend.bookingId,
  };
}

