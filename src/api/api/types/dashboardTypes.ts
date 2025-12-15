// Dashboard and analytics contracts

export interface TopFacilityDto {
  facilityName: string;
  bookingCount: number;
}

export interface MonthlyBookingDto {
  month: string;
  count: number;
}

export interface DashboardStatsResponse {
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  totalReports: number;
  pendingReports: number;
  topFacilities: TopFacilityDto[];
  bookingInMonths: MonthlyBookingDto[];
}
