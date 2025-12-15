// Security task contracts

export interface SecurityTask {
  securityTaskId?: number;
  title: string;
  description?: string;
  priority?: string;
  assignedToUserId?: number;
  createdBy?: number;
  status: string;
  reportNote?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  assignedToId?: number;
}

export interface CompleteTaskRequest {
  reportNote?: string;
}
