import { apiClient } from '../../httpClient';
import type {
  ApiMessageResponse,
  CreateUserRequest,
  PagedResult,
  UpdateRoleRequest,
  UpdateUserRequest,
  UserFilterRequest,
  UserResponse,
} from '../types';

export const usersController = {
  async getUsers(filters?: UserFilterRequest): Promise<PagedResult<UserResponse>> {
    const params = filters && Object.keys(filters).length ? filters : undefined;
    const { data } = await apiClient.get<PagedResult<UserResponse>>('/Users', { params });
    return data;
  },

  async createUser(payload: CreateUserRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.post<ApiMessageResponse>('/Users', payload);
    return data;
  },

  async updateUser(id: number, payload: UpdateUserRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Users/${id}`, payload);
    return data;
  },

  async updateRole(id: number, payload: UpdateRoleRequest): Promise<ApiMessageResponse> {
    const { data } = await apiClient.put<ApiMessageResponse>(`/Users/${id}/role`, payload);
    return data;
  },

  async deleteUser(id: number): Promise<ApiMessageResponse> {
    const { data } = await apiClient.delete<ApiMessageResponse>(`/Users/${id}`);
    return data;
  },
};

export default usersController;
