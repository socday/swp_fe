// User, role, and authentication contracts

export interface Role {
  roleId: number;
  roleName: string;
  description?: string;
}

export interface User {
  userId: number;
  email: string;
  passwordHash?: string;
  fullName: string;
  roleId: number;
  phoneNumber?: string;
  isActive: boolean;
  createdAt?: string;
  role?: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message?: string;
  user?: User;
}

export interface UserFilterRequest {
  keyword?: string;
  roleId?: number;
  pageIndex?: number;
  pageSize?: number;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  roleId: number;
}

export interface UpdateUserRequest {
  fullName: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface UpdateRoleRequest {
  newRoleId: number;
}

export interface UserResponse {
  userId: number;
  email: string;
  fullName: string;
  roleName: string;
  isActive: boolean;
}
