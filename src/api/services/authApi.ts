import authController from '../api/controllers/authController';
import type { LoginRequest, LoginResponse, User } from '../api/types';
import { apiClient } from '../httpClient';
import { mapBackendRole, persistToken, safeErrorMessage } from './common';

export const authApi = {
  async login(
    data: LoginRequest
  ): Promise<{ success: boolean; user?: any; token?: string; error?: string }> {
    try {
      const result = await authController.login(data);

      if (!result?.token) {
        return { success: false, error: result?.message || 'Login failed' };
      }

      persistToken(result.token);

      const backendUser: Partial<User> & {
        role?: string | { roleName?: string };
      } =
        result.user ??
        ((result as unknown as Partial<User> & { role?: string }).userId
          ? (result as unknown as Partial<User> & { role?: string })
          : {});

      const mappedUser = backendUser.userId
        ? {
            id: backendUser.userId.toString(),
            name: backendUser.fullName || '',
            email: backendUser.email || data.email,
            role: mapBackendRole(
              typeof backendUser.role === 'string'
                ? backendUser.role
                : backendUser.role?.roleName
            ),
          }
        : undefined;

      return { success: true, user: mappedUser, token: result.token };
    } catch (error) {
      const message = safeErrorMessage(error, 'Failed to login');
      console.error('Error during login:', error);
      return { success: false, error: message };
    }
  },
};

export async function loginWithGoogle(accessToken: string): Promise<LoginResponse> {
  const res = await apiClient.post<LoginResponse>("/Auth/google-login", 
    { idToken: accessToken }, 
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};