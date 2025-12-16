import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  Report,
  ReportCreateRequest,
  ReportStatusUpdate,
} from '../types';

export const reportsController = {
  // Create report
  async createReport(payload: ReportCreateRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>(
      '/Report',
      payload
    );
    return data;
  },

  // Get all reports
  async getReports(): Promise<Report[]> {
    const { data } = await apiClient.get<Report[]>(
      '/Report'
    );
    return data;
  },

  // Update report status
  async updateStatus(
    id: number,
    payload: ReportStatusUpdate
  ): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(
      `/Report/${id}/status`,
      payload
    );
    return data;
  },
};

export default reportsController;
