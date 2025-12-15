import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  Report,
  ReportCreateRequest,
  ReportStatusUpdate,
} from '../types';

export const reportsController = {
  async createReport(payload: ReportCreateRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/Reports', payload);
    return data;
  },

  async getReports(): Promise<Report[]> {
    const { data } = await apiClient.get<Report[]>('/Reports');
    return data;
  },

  async updateStatus(id: number, payload: ReportStatusUpdate): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Reports/${id}/status`, payload);
    return data;
  },
};

export default reportsController;
