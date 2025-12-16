import { slotsApi } from './api';
import type { FrontendSlot } from './apiAdapters';

// Time Slots Configuration for FPTU Facility Booking System
export interface TimeSlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  displayTime: string;
}

const normalizeTime = (time?: string): string => {
  if (!time) return '';
  const [hours = '00', minutes = '00'] = time.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
};

const FALLBACK_TIME_SLOTS: TimeSlot[] = [
  {
    id: 1,
    label: 'Slot 1',
    startTime: '07:00',
    endTime: '09:00',
    displayTime: '7:00 - 9:00',
  },
  {
    id: 2,
    label: 'Slot 2',
    startTime: '09:00',
    endTime: '11:00',
    displayTime: '9:00 - 11:00',
  },
  {
    id: 3,
    label: 'Slot 3',
    startTime: '12:00',
    endTime: '14:00',
    displayTime: '12:00 - 14:00',
  },
  {
    id: 4,
    label: 'Slot 4',
    startTime: '14:00',
    endTime: '16:00',
    displayTime: '14:00 - 16:00',
  },
  {
    id: 5,
    label: 'Slot 5',
    startTime: '16:00',
    endTime: '18:00',
    displayTime: '16:00 - 18:00',
  },
];

export const TIME_SLOTS: TimeSlot[] = FALLBACK_TIME_SLOTS;

let cachedSlots: TimeSlot[] | null = null;
let inflightRequest: Promise<TimeSlot[]> | null = null;

const mapSlotFromApi = (slot: FrontendSlot): TimeSlot => {
  const start = normalizeTime(slot.startTime);
  const end = normalizeTime(slot.endTime);
  return {
    id: slot.id,
    label: slot.name || `Slot ${slot.id}`,
    startTime: start,
    endTime: end,
    displayTime: `${start} - ${end}`,
  };
};

const getFallbackSlots = (): TimeSlot[] => TIME_SLOTS;

export const getCachedTimeSlots = (): TimeSlot[] => cachedSlots ?? getFallbackSlots();

export const fetchTimeSlots = async (options?: { force?: boolean }): Promise<TimeSlot[]> => {
  if (!options?.force && cachedSlots) {
    return cachedSlots;
  }

  if (!options?.force && inflightRequest) {
    return inflightRequest;
  }

  inflightRequest = slotsApi
    .getAll()
    .then((slots) => {
      const normalized = slots
        .filter((slot) => slot.isActive !== false)
        .map(mapSlotFromApi);
      cachedSlots = normalized.length > 0 ? normalized : getFallbackSlots();
      return cachedSlots;
    })
    .catch((error) => {
      console.error('Failed to fetch time slots from API', error);
      cachedSlots = getFallbackSlots();
      return cachedSlots;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
};

export const getSlotById = (id: number): TimeSlot | undefined => {
  return getCachedTimeSlots().find((slot) => slot.id === id);
};

export const getSlotByTime = (startTime: string, endTime: string): TimeSlot | undefined => {
  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = normalizeTime(endTime);
  return getCachedTimeSlots().find(
    (slot) => slot.startTime === normalizedStart && slot.endTime === normalizedEnd
  );
};

export const isTimeInSlot = (time: string, slot: TimeSlot): boolean => {
  const normalizedTime = normalizeTime(time);
  return normalizedTime >= slot.startTime && normalizedTime < slot.endTime;
};
