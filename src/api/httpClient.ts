import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL, API_KEY } from '../utils/config';

const shouldLogApiTraffic =
  (typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)) ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

const logApiEvent = (label: string, payload: Record<string, unknown>) => {
  if (shouldLogApiTraffic) {
    console.debug(label, payload);
  }
};

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

  logApiEvent('[API Request]', {
    method: config.method?.toUpperCase(),
    url: `${config.baseURL || ''}${config.url || ''}`,
    params: config.params || null,
    data: config.data || null,
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    logApiEvent('[API Response]', {
      url: `${response.config.baseURL || ''}${response.config.url || ''}`,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error: AxiosError) => {
    logApiEvent('[API Response Error]', {
      url: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
      status: error.response?.status,
      data: error.response?.data || null,
      message: error.message,
    });
    const fallbackMessage = error.message || 'Unexpected API error';
    const payload = (error.response?.data as { message?: string; error?: string }) || {};
    const normalizedError = new Error(payload.message || payload.error || fallbackMessage);
    // Attach status and raw response so callers can inspect HTTP status codes (e.g., 401)
    (normalizedError as any).status = error.response?.status;
    (normalizedError as any).response = error.response?.data;
    return Promise.reject(normalizedError);
  }
);

export { apiClient };
