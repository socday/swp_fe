
export interface ReportCreateRequest {
  facilityId: number;
  title: string;
  description: string;
  reportType: string; 
  bookingId?: number;
}

export interface ReportResponse {
  reportId: number;
  title: string;
  description: string;
  reportType: string;  
  status: string;      
  createdAt: string;
  createdBy: string;
  facilityName: string;
}