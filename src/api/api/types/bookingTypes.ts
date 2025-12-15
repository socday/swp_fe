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
