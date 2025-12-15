// Facility, asset, and facility-type contracts

import type { Campus } from './campusTypes';

export interface FacilityType {
  typeId: number;
  typeName: string;
  requiresApproval?: boolean;
  description?: string;
}

export interface Asset {
  assetId: number;
  assetName: string;
  assetType: string;
  description?: string;
}

export interface FacilityAsset {
  id: number;
  facilityId: number;
  assetId: number;
  quantity?: number;
  condition?: string;
  asset?: Asset;
}

export interface Facility {
  facilityId: number;
  facilityName: string;
  campusId: number;
  typeId: number;
  capacity: number;
  status: string;
  imageUrl?: string;
  description?: string;
  createdAt?: string;
  campus?: Campus;
  type?: FacilityType;
  facilityAssets?: FacilityAsset[];
}

export interface FacilityCreateRequest {
  facilityName: string;
  campusId: number;
  typeId: number;
  imageUrl?: string;
  status?: string;
}

export interface FacilityUpdateRequest {
  facilityName: string;
  campusId: number;
  typeId: number;
  imageUrl?: string;
  status: string;
}

export interface FacilityTypeDto {
  typeId?: number;
  typeName: string;
}

export interface UpdateConditionRequest {
  id: number;
  condition: string;
  quantity?: number;
}
