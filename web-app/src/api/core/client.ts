import axios from "axios";
import { startAuthTokenListener, getTokenForRequest } from "../lib/auth";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Global API client instance used throughout the application
 */
const apiClient = axios.create({
  baseURL:
    (typeof window !== "undefined" && import.meta.env.VITE_API_BASE_URL) ||
    "http://localhost:3000",
  timeout: 600000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Start token listener once (async but don't block initialization)
startAuthTokenListener().catch(error => {
  console.error('Failed to initialize auth token listener:', error);
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(async (config) => {
  // Get token from Firebase (it handles caching and refresh internally)
  const token = await getTokenForRequest();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // Log token usage for debugging (only first/last 8 chars for security)
    if (import.meta.env.DEV) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url} - Token: ${token.substring(0, 8)}...${token.substring(token.length - 8)}`);
    }
  } else {
    console.warn(`[API] ${config.method?.toUpperCase()} ${config.url} - No token available`);
  }

  return config;
});

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401/403 and haven't already retried, try refreshing the token
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      console.warn(`[API] ${error.response?.status} error on ${originalRequest.method?.toUpperCase()} ${originalRequest.url} - Attempting token refresh...`);
      originalRequest._retry = true;

      try {
        // Get a fresh token from Firebase (force refresh)
        const newToken = await getTokenForRequest();
        
        if (newToken) {
          // Update the authorization header with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          console.log(`[API] Token refreshed, retrying ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
          
          // Retry the original request with the new token
          return apiClient(originalRequest);
        } else {
          console.error('[API] Token refresh returned null - user may need to re-login');
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed in interceptor:', refreshError);
        // Fall through to return the original error
      }
    }

    const errorData = {
      message: error.response?.data?.message || 'An unknown error occurred',
      status: error.response?.status,
      code: error.response?.data?.code,
    };
    return Promise.reject(errorData);
  }
);

export { apiClient };
