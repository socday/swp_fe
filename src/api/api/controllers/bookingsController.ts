import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  Booking,
  BookingAvailabilityResponse,
  BookingCreateRequest,
  BookingFilterRequest,
  BookingIndividualSummary,
  BookingRecurringRequest,
  BookingStatusUpdate,
  RecurringBookingSummary,
  StaffCancelRequest,
} from '../types';

export const bookingsController = {
  async createBooking(payload: BookingCreateRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/Bookings', payload, {});
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

  async getBookingRecurrenceGroup (id?: number): Promise<RecurringBookingSummary[]>{
    const params = id ? { id } : undefined;
    const { data } = await apiClient.get<RecurringBookingSummary[]>('/Bookings/recurring-groups', { params });
    return data;
  },

  async getBookingListOfRecurrenceGroup (id?: string): Promise<Booking[]>{
    const params = id ? { id } : undefined;
    const { data } = await apiClient.get<Booking[]>(`/Bookings/recurring-group/${id}`);
    return data;
  },

  async getBookingIndividual (id?: number, status?: string): Promise<Booking[]>{
    const params = id || status ? { ...(id && { id }), ...(status && { status }) } : undefined;
    const { data } = await apiClient.get<Booking[]>('/Bookings/individual', { params });
    console.log('Fetched individual bookings data controller:', data);
    return data;
  },
};

export default bookingsController;
