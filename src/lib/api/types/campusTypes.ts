// Campus domain types

export interface Campus {
  campusId: number;
  campusName: string;
  address?: string;
  isActive: boolean;
}

export interface CampusDto {
  campusId?: number;
  campusName: string;
  address?: string;
  isActive?: boolean;
}
