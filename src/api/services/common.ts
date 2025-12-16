import type { User, UserResponse } from '../api/types';

type AppRole = 'student' | 'lecturer' | 'admin' | 'staff' | 'security';

type BackendUserLike = Partial<User> &
  Partial<UserResponse> & {
    role?: string | { roleName?: string };
  };

export const mapBackendRole = (backendRole?: string): AppRole => {
  const roleMap: Record<string, AppRole> = {
    Student: 'student',
    Lecturer: 'lecturer',
    Admin: 'admin',
    Staff: 'staff',
    Security: 'security',
  };

  return roleMap[backendRole || ''] || 'student';
};

export const persistToken = (token?: string): void => {
  if (!token) return;
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
  }
};

export const safeErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
};

export interface UserData {
  id: number;
  name: string;
  email: string;
  role: AppRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export const adaptUserData = (backend: BackendUserLike): UserData => {
  const email = backend.email || '';
  const backendRoleName =
    typeof backend.role === 'string'
      ? backend.role
      : backend.role?.roleName || backend.roleName;

  return {
    id: backend.userId ?? 0,
    name: backend.fullName || '',
    email,
    role: mapBackendRole(backendRoleName),
    status: backend.isActive === false ? 'Inactive' : 'Active',
    createdAt: backend.createdAt || new Date().toISOString(),
  };
};

export type { AppRole };
