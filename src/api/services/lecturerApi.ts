import { reportsApi } from "./reportsApi";

export const studentApi = {
  async createReport(payload: {
    facilityId: number;
    title: string;
    description: string;
    reportType: string;
    bookingId?: number;
  }): Promise<boolean> {
    const result = await reportsApi.create(payload);
    return result.success;
  },
};
