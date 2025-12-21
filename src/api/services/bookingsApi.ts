import {
  adaptBookings,
  toBackendBooking,
  type FrontendBooking,
} from '../apiAdapters';
import bookingsController from '../api/controllers/bookingsController';
import type {
  Booking,
  BookingAvailabilityResponse,
  BookingFilterRequest,
  BookingRecurringRequest,
  BookingStatusUpdate,
  RecurringBookingSummary,
  StaffCancelRequest,
  PagedResult,
} from '../api/types';
import { safeErrorMessage } from './common';

export interface PaginatedBookings {
  bookings: FrontendBooking[];
  totalRecords: number;
  pageIndex: number;
  pageSize: number;
}

export const bookingsApi = {
  async getAll(status?: string): Promise<FrontendBooking[]> {
    try {
      const filters: BookingFilterRequest | undefined = status ? { status } : undefined;
      const data = await bookingsController.getBookings(filters);
      console.log('Fetched bookings data:', data);
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
      console.log('Fetched filtered bookings data:', data);
      if (Array.isArray((data as any)?.items)) {
        return adaptBookings((data as any).items || []);
      }
      return adaptBookings((data as Booking[]) || []);
    } catch (error) {
      console.error('Error fetching filtered bookings:', error);
      return [];
    }
  },

  async getFilteredPaginated(filters?: BookingFilterRequest): Promise<PaginatedBookings> {
    try {
      const data = await bookingsController.getBookingsPaginated(filters);
      console.log('Fetched paginated bookings data:', data);
      return {
        bookings: adaptBookings(data.items || []),
        totalRecords: data.totalRecords,
        pageIndex: data.pageIndex,
        pageSize: data.pageSize,
      };
    } catch (error) {
      console.error('Error fetching paginated bookings:', error);
      return {
        bookings: [],
        totalRecords: 0,
        pageIndex: filters?.pageIndex || 1,
        pageSize: filters?.pageSize || 10,
      };
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

  async updateStatus(
    id: number,
    statusUpdate: BookingStatusUpdate
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await bookingsController.updateStatus(id, statusUpdate);
      return {
        success: true,
        message: response?.message,
      };
    } catch (error) {
      const errorMessage = safeErrorMessage(error, 'Failed to update booking status');
      console.error('Error updating booking status:', error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  async checkAvailability(
    facilityId: number,
    date: string
  ): Promise<BookingAvailabilityResponse | null> {
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

  async updateRecurringStatus(
    recurrenceId: string,
    statusUpdate: BookingStatusUpdate
  ): Promise<boolean> {
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

  async getBookingIndividual (id?: number, status?: string): Promise<FrontendBooking[]>{
    try {
      const data = await bookingsController.getBookingIndividual(id, status);
      console.log('Fetched individual bookings data API:', data);
      return adaptBookings(data || []);
    } catch (error) {
      console.error('Error fetching individual bookings:', error);
      return [];
    }
  },

  async getBookingRecurrenceGroup (id?: number): Promise<RecurringBookingSummary[]>{
    try {
      const data = await bookingsController.getBookingRecurrenceGroup(id);
      return data;
    } catch (error)
    {
      console.error('Error fetching booking recurrence groups:', error);
      return [];
    }
  },

  async getBookingListOfRecurrenceGroup (id?: string): Promise<Booking[]>{
    try {
      const data = await bookingsController.getBookingListOfRecurrenceGroup(id);
      return data;
    } catch (error)
    {
      console.error('Error fetching booking recurrence groups:', error);
      return [];
    }
  },
};
