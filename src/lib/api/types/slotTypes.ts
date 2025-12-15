// Slot and schedule-related contracts

export interface Slot {
  slotId: number;
  slotName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface BookingAvailabilityResponse {
  facilityId: number;
  date: string;
  bookedSlotIds: number[];
}
