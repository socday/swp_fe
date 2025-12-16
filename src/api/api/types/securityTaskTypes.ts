// Security task contracts
export interface SecurityTask {
  taskId: number;
  title: string;
  description?: string;

  status: string;        // "Pending" | "Completed"
  priority: string;      // "High" | "Normal" | "Low"

  assignedToUserId?: number;
  createdBy?: number;

  reportNote?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface CompleteTaskRequest {
  reportNote?: string;
}
