export { authApi } from './services/authApi';
export { campusesApi } from './services/campusesApi';
export { facilitiesApi } from './services/facilitiesApi';
export { slotsApi } from './services/slotsApi';
export { bookingsApi } from './services/bookingsApi';
export { reportsApi } from './services/reportsApi';
export { notificationsApi } from './services/notificationsApi';
export { roomsApi, facilityToRoom } from './services/roomsApi';
export { legacyBookingsApi } from './services/legacyBookingsApi';
export { adminApi } from './services/adminApi';
export { analyticsApi } from './services/analyticsApi';
export { staffApi } from './services/staffApi';
export { securityApi } from './services/securityApi';
export { initData } from './services/initData';

export type { Room } from './services/roomsApi';
export type { UserData } from './services/common';
export type { AdvancedAnalytics } from './services/adminApi';

export * from './api/types';
