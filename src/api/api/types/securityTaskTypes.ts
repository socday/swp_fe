// Security task contracts
export interface SecurityTask {
  taskId: number;
  title: string;
  description?: string;

  status: string;      
  priority: string;
  taskType: TaskType;
  assignedToUserId?: number;
  assignedToUserName?: string;
  createdBy?: number;

  reportNote?: string;
  createdAt?: string;
  completedAt?: string;
}
export type TaskType =
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CHECKED_NOT_IN";

export interface CompleteTaskRequest {
  reportNote?: string;
}

export interface createSecurityTask {
  title: string;
  description: string;
  priority?: string;      
  assignedToId: number;
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

