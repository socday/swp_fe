import { apiClient } from '../../httpClient';
import type { DashboardStatsResponse } from '../types';

export const dashboardController = {
  async getStats(): Promise<DashboardStatsResponse> {
    const { data } = await apiClient.get<DashboardStatsResponse>('/Dashboard/stats');
    return data;
  },
};

export default dashboardController;
