
export interface SecurityUIReport {
  roomId: string;
  roomName: string;
  reporterRole: string;
  reporterName: string;
  reporterId: number;
  type: string;        
  severity: string;
  description: string;
}

export interface ReportCreateRequest {
  facilityId: number;
  title: string;
  description: string;
  reportType: string; 
  bookingId?: number;
}