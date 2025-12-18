import { adaptReports, toBackendReport, type FrontendReport } from '../apiAdapters';
import reportsController from '../api/controllers/reportsController';
import type { ReportCreateRequest, ReportStatusUpdate } from '../api/types';
import { safeErrorMessage } from './common';
import { ApiBooking } from '../api/types';

export const reportsApi = {
  async getAll(status?: string): Promise<FrontendReport[]> {
    try {
      const reports = await reportsController.getReports();
      const filtered = status ? (reports || []).filter((r) => r.status === status) : reports;
      return adaptReports(filtered || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  },

  async create(
    report: ReportCreateRequest
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const payload = toBackendReport(report);
      const response = await reportsController.createReport(payload);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Error creating report:', error);
      return { success: false, error: safeErrorMessage(error, 'Failed to create report') };
    }
  },

  async resolve(id: number, resolution: string): Promise<boolean> {
    try {
      await reportsController.updateStatus(id, { status: 'Resolved' });
      return true;
    } catch (error) {
      console.error('Error resolving report:', error);
      return false;
    }
  },

  async updateStatus(id: number, statusUpdate: ReportStatusUpdate): Promise<boolean> {
    try {
      await reportsController.updateStatus(id, statusUpdate);
      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  },
};
