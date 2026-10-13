import axios from 'axios';

/**
 * Normalizes the API base URL to ensure proper endpoint routing in both local and deployed environments.
 * - In local dev with no VITE_API_URL: defaults to '/api' (proxied by Vite to http://localhost:5001)
 * - In production: accepts 'https://backend.com', 'https://backend.com/', 'https://backend.com/api', or 'https://backend.com/api/'
 *   and normalizes to 'https://backend.com/api' so all requests (/auth/login, /complaints, etc.) resolve to /api/*
 */
export function normalizeApiBaseUrl(): string {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    ''
  ).trim();

  if (!envUrl) {
    return '/api';
  }

  // Remove trailing slashes
  const cleaned = envUrl.replace(/\/+$/, '');

  // If already ends with /api, return cleaned
  if (cleaned.endsWith('/api')) {
    return cleaned;
  }

  // Otherwise append /api to ensure /auth/login resolves to /api/auth/login
  return `${cleaned}/api`;
}

export const API_BASE_URL = normalizeApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('civic_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (!isAuthRoute && localStorage.getItem('civic_token')) {
        localStorage.removeItem('civic_token');
        localStorage.removeItem('civic_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error: any): string {
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'Unable to connect to the backend server. Please verify the backend is running on port 5001.';
  }
  if (
    (error.response?.status === 500 || error.response?.status === 502 || error.response?.status === 504) &&
    typeof error.response?.data === 'string' &&
    (error.response?.data?.includes('ECONNREFUSED') || error.response?.data?.includes('connect ECONNREFUSED'))
  ) {
    return 'Backend server is initializing or unreachable on port 5001. Please wait a moment and try again.';
  }
  if (
    error.response?.status === 404 &&
    (!error.response?.data ||
      typeof error.response?.data === 'string' ||
      error.response?.data?.message === 'The page could not be found')
  ) {
    return 'Backend server is unreachable or API route was not found. Please ensure the backend server is running (run `npm run dev` from the project root).';
  }
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }
  if (typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  if (typeof error.response?.data === 'string' && error.response.data.length < 150) {
    return error.response.data;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
