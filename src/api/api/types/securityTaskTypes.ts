// Security task contracts

export interface SecurityTask {
  securityTaskId?: number;
  id?: string | number;
  title: string;
  description?: string;
  priority?: string;
  assignedToUserId?: number;
  assignedToName?: string;
  createdBy?: number;
  status: string;
  reportNote?: string;
  createdAt?: string;
  completedAt?: string;
  bookingId?: string | number;
  roomId?: string | number;
  roomName?: string;
  campus?: string;
  building?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: 'unlock_room' | 'lock_room' | 'inspection' | 'maintenance' | string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  assignedToId?: number;
  bookingId?: number;
  roomId?: number;
  roomName?: string;
  campus?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  taskType?: string;
}

export interface CompleteTaskRequest {
  reportNote?: string;
}
