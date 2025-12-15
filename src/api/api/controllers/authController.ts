import { apiClient } from '../../httpClient';
import type { LoginRequest, LoginResponse } from '../types';

export const authController = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/Auth/login', payload);
    return data;
  },
};

export default authController;
