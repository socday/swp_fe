import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  Booking,
  BookingAvailabilityResponse,
  BookingCreateRequest,
  BookingFilterRequest,
  BookingRecurringRequest,
  BookingStatusUpdate,
  StaffCancelRequest,
} from '../types';

export const bookingsController = {
  async createBooking(payload: BookingCreateRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/Bookings', payload);
    return data;
  },

  async updateStatus(id: number, payload: BookingStatusUpdate): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Bookings/${id}/status`, payload);
    return data;
  },

  async checkAvailability(facilityId: number, date: string): Promise<BookingAvailabilityResponse> {
    const { data } = await apiClient.get<BookingAvailabilityResponse>('/Bookings/availability', {
      params: { facilityId, date },
    });
    return data;
  },

  async cancelBooking(id: number): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Bookings/${id}/cancel`, {});
    return data;
  },

  async getSecuritySchedule(campusId: number): Promise<Booking[]> {
    const { data } = await apiClient.get<Booking[]>('/Bookings/schedule-today', {
      params: { campusId },
    });
    return data;
  },

  async createRecurringBooking(payload: BookingRecurringRequest): Promise<unknown> {
    const { data } = await apiClient.post('/Bookings/recurring', payload);
    return data;
  },

  async updateRecurringStatus(recurrenceId: string, payload: BookingStatusUpdate): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Bookings/recurring/${recurrenceId}/status`, payload);
    return data;
  },

  async staffCancelBooking(id: number, payload: StaffCancelRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Bookings/staff-cancel/${id}`, payload);
    return data;
  },

  async getBookings(filters?: BookingFilterRequest): Promise<Booking[]> {
    const params = filters && Object.keys(filters).length ? filters : undefined;
    const { data } = await apiClient.get<Booking[]>('/Bookings', { params });
    return data;
  },
};

export default bookingsController;
