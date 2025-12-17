// Booking domain contracts

import type { Facility } from './facilityTypes';
import type { Slot } from './slotTypes';
import type { User } from './userTypes';

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

export interface GetBookingRepsonse {
  bookedBy:string;
  bookingDate: Date;
  bookingId: number;
  rejectionReason?: string;
  purpose: string;
  slotId: number;
  facilityId: number;
  campusName: string;
  endTime: Date;
  facilityName: string;
  startTime: Date;
  status: string;
  userId: number;
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
  purpose: string;
  startDate: string;
  endDate: string;
  pattern: number; // RecurrencePattern: 1=Daily, 2=Weekly, 3=Weekdays, 4=Weekends, 5=Monthly, 6=Custom
  daysOfWeek: number[]; // Vietnamese format: 2=Monday, 3=Tuesday, ..., 8=Sunday
  interval: number; // Repetition interval (default 1)
  autoFindAlternative: boolean; // Auto-find alternative rooms
  skipConflicts: boolean; // Skip conflicts or fail entire operation
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
