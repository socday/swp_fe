// Notification contracts

import type { User } from './userTypes';

export interface Notification {
  notificationId: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type?: string;
  createdAt?: string;
  user?: User;
}

export interface CreateNotiRequest {
  userId: number;
  title: string;
  message: string;
}
