/**
 * API Adapters - Map Backend Responses to Frontend Format
 * 
 * Backend uses: campusId, facilityId, userId, etc.
 * Frontend uses: id, name (for consistency)
 * 
 * This file ensures all API responses are transformed to match frontend expectations
 */
import type { Campus, Facility, Slot, Booking, Report, Notification, GetBookingRepsonse, GetFacilityResponse, GetBookingResponse } from './api/types';

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
  campusName: string;
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
  slotId?: number;
  status: string;
  purpose?: string;
  rejectionReason?: string;
  userName?: string;
  facilityName?: string;
  bookedBy?: string;
  startTime?: string;     
  endTime?: string;  
}

export interface FrontendReport {
  reportId: number;
  title: string;
  description: string;
  reportType: string;
  status: string;

  createdAt: string;
  resolvedAt?: string;

  createdBy?: string;    
  facilityId?: number;
  facilityName?: string;
  bookingId?: number;
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
export function adaptFacility(backend: GetFacilityResponse): FrontendFacility {
  return {
    id: backend.facilityId,
    name: backend.facilityName,
    capacity: backend.facilityCapacity,
    typeName: backend.typeName,
    campusName: backend.campusName,

    status: backend.status,
    imageUrl: backend.imageUrl,

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
export function adaptBooking(
  backend: Booking 
): FrontendBooking {
  return {
    id: backend.bookingId,
    userId: backend.userId,
    userName: backend.userName,
    bookedBy: backend.bookedBy,
    facilityId: backend.facilityId,
    facilityName: backend.facilityName,
    date: backend.bookingDate,
    slotId: backend.slotId,
    startTime: backend.startTime ,
    endTime: backend.endTime,
    status: backend.status,
    purpose: backend.purpose,
    rejectionReason: backend.rejectionReason,
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
    resolvedAt: backend.resolvedAt,

    createdBy: backend.createdBy,
    facilityId: backend.facilityId,
    facilityName: backend.facilityName,
    bookingId: backend.bookingId,
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
    isRead: backend.isRead ?? false,
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

