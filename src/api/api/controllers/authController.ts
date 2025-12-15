import { apiClient } from '../../httpClient';
import type { ApiMessageResponse, CreateUserRequest, LoginRequest, LoginResponse } from '../types';

export const authController = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/Auth/login', payload);
    return data;
  },

  async createUser(payload: CreateUserRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/Users', payload);
    return data;
  },
};

export default authController;
