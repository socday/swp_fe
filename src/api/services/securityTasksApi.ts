import securityTaskController from '../api/controllers/securityTaskController';
import usersController from '../api/controllers/usersController';
import type {
  createSecurityTask,
  CreateTaskRequest,
  SecurityTask,
  UserFilterRequest,
  UserResponse,
} from '../api/types';
import { safeErrorMessage } from './common';

const SECURITY_ROLE_ID = 6;
const DEFAULT_TASK_PRIORITY = 'Medium';
const DEFAULT_TASK_TYPE = 'unlock_room';

export interface BookingForSecurityTask {
  id: string | number;
  roomId?: string | number;
  roomName?: string;
  campus?: string;
  building?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  userName?: string;
  purpose?: string;
}

const normalizeNumericId = (value?: string | number | null): number | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const fetchSecurityStaff = async (): Promise<UserResponse[]> => {
  try {
    const filters: UserFilterRequest = { roleId: SECURITY_ROLE_ID, pageIndex: 1, pageSize: 1000 };
    const result = await usersController.getUsers(filters);
    return result?.items ?? [];
  } catch (error) {
    console.error('Failed to load security staff list:', error);
    return [];
  }
};

const fetchPendingTasks = async (): Promise<SecurityTask[]> => {
  try {
    return await securityTaskController.getSecurityTasks();
  } catch (error) {
    console.error('Failed to load pending security tasks:', error);
    return [];
  }
};

const pickAssignee = (
  staff: UserResponse[],
  pendingTasks: SecurityTask[]
): UserResponse | undefined => {
  if (!staff.length) return undefined;
  const loadMap = new Map<number, number>();

  pendingTasks.forEach((task) => {
    const assigneeId = task.assignedToUserId ?? normalizeNumericId(task.assignedToUserId as any);
    if (!assigneeId) return;
    loadMap.set(assigneeId, (loadMap.get(assigneeId) ?? 0) + 1);
  });

  return [...staff].sort((a, b) => {
    const aCount = loadMap.get(a.userId) ?? 0;
    const bCount = loadMap.get(b.userId) ?? 0;
    if (aCount !== bCount) return aCount - bCount;
    return a.userId - b.userId;
  })[0];
};

const buildTaskTitle = (booking: BookingForSecurityTask): string => {
  const room = booking.roomName ? ` ${booking.roomName}` : '';
  const campus = booking.campus ? ` (${booking.campus})` : '';
  return `Secure${room}${campus}`.trim();
};

const buildTaskDescription = (booking: BookingForSecurityTask): string => {
  const date = booking.date ? new Date(booking.date).toLocaleDateString('en-US') : 'Scheduled date TBD';
  const timeWindow = booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : 'Time TBD';
  const requester = booking.userName ? `Requested by ${booking.userName}.` : '';
  const purpose = booking.purpose ? `Purpose: ${booking.purpose}.` : '';
  const location = booking.roomName ? `Room: ${booking.roomName}.` : '';
  const building = booking.building ? `Building: ${booking.building}.` : '';
  return `${location} ${building} ${requester} ${purpose} Date: ${date}. Time: ${timeWindow}.`.replace(/\s+/g, ' ').trim();
};

export const securityTasksApi = {
  async getSecurityTasks(): Promise<SecurityTask[]> {
    return fetchPendingTasks();
  },

  // 🔹 Confirm / complete security task
  async completeTask(
    taskId: number,
    reportNote?: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await securityTaskController.completeTask(taskId, {  
        reportNote,
      });

      return {
        success: true,
        message: response?.message ?? 'Đã hoàn thành nhiệm vụ',
      };
    } catch (error) {
      const message = safeErrorMessage(error, 'Failed to complete security task');
      console.error('Complete security task failed:', error);
      return { success: false, error: message };
    }
  },

  
  async createSecurityTask(task: createSecurityTask): Promise<boolean> {
    try {
      await securityTaskController.assignTask(task);
      return true;
    } catch (error) {
      console.error("Failed to create security task:", error);
      return false;
    }
  },

  async assignTask(payload: CreateTaskRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await securityTaskController.assignTask(payload);
      return { success: true, message: response?.message };
    } catch (error) {
      const message = safeErrorMessage(error, 'Failed to assign security task');
      console.error('Security task assignment failed:', error);
      return { success: false, error: message };
    }
  },

  async autoAssignForBooking(): Promise<{
    success: boolean;
    error?: string;
    assignedTo?: { id: number; name: string };
  }> {

    const [staffMembers, pendingTasks] = await Promise.all([
      fetchSecurityStaff(),
      fetchPendingTasks(),
    ]);

    if (!staffMembers.length) {
      return { success: false, error: 'No security staff available for assignment' };
    }

    const assignee = pickAssignee(staffMembers, pendingTasks);
    if (!assignee) {
      return { success: false, error: 'Unable to determine a security staff assignee' };
    }



    return {
      success: true,
      assignedTo: {
        id: assignee.userId,
        name: assignee.fullName,
      },
    };
  },
};

export type { SecurityTask };