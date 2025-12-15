// Time Slots Configuration for FPTU Facility Booking System
export interface TimeSlot {
  id: number;
  label: string;
  startTime: string;
  endTime: string;
  displayTime: string;
}

export const TIME_SLOTS: TimeSlot[] = [
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

export const getSlotById = (id: number): TimeSlot | undefined => {
  return TIME_SLOTS.find(slot => slot.id === id);
};

export const getSlotByTime = (startTime: string, endTime: string): TimeSlot | undefined => {
  return TIME_SLOTS.find(
    slot => slot.startTime === startTime && slot.endTime === endTime
  );
};

export const isTimeInSlot = (time: string, slot: TimeSlot): boolean => {
  return time >= slot.startTime && time < slot.endTime;
};
