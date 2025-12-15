import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/config';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  if (API_KEY) {
    config.headers.set('X-API-Key', API_KEY);
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const fallbackMessage = error.message || 'Unexpected API error';
    const payload = (error.response?.data as { message?: string; error?: string }) || {};
    const normalizedError = new Error(payload.message || payload.error || fallbackMessage);
    return Promise.reject(normalizedError);
  }
);

export { apiClient };
