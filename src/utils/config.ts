/**
 * Configuration for custom backend API
 * Reads from environment variables with fallback to default values
 */

// Get API base URL from environment or use default localhost
export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:5000/api';

export const API_GOOGLE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) || '458309975048-1t73mf6o9l62a5g7655t039n08qsa2nb.apps.googleusercontent.com';
// Optional API key if your backend requires authentication
export const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) || '';

// Flag to enable/disable mock data when backend is unavailable
export const USE_MOCK_DATA_FALLBACK = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK_DATA) === 'true' || false;

// Helper function to get headers for API requests
export const getApiHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Add API key to headers if it exists
  if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  // Add auth token if it exists
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to build API URL
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Helper function to check if backend is reachable
export const checkBackendHealth = async (): Promise<{ 
  isReachable: boolean; 
  error?: string;
  url: string;
}> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
    
    const response = await fetch(buildApiUrl('/Campuses'), { 
      headers: getApiHeaders(),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    return {
      isReachable: response.ok || response.status < 500,
      url: API_BASE_URL,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      isReachable: false,
      error: errorMessage,
      url: API_BASE_URL,
    };
  }
};