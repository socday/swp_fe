// Report domain contracts

import type { Booking } from './bookingTypes';
import type { Facility } from './facilityTypes';
import type { User } from './userTypes';

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
