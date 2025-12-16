export const analyticsApi = {
  async getUsageReports(): Promise<any[]> {
    console.warn('analyticsApi.getUsageReports() not implemented for backend');
    return [];
  },
  async exportReport(): Promise<Blob | null> {
    console.warn('analyticsApi.exportReport() not implemented for backend');
    return null;
  },
};
