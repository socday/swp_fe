import { adaptCampuses, type FrontendCampus } from '../apiAdapters';
import campusesController from '../api/controllers/campusesController';

export const campusesApi = {
  async getAll(): Promise<FrontendCampus[]> {
    try {
      const data = await campusesController.getCampuses();
      return adaptCampuses(data || []);
    } catch (error) {
      console.error('Error fetching campuses:', error);
      return [];
    }
  },
};
