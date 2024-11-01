import { createHttpClient } from './http.service';
import { tokenService } from '../token.service';

/**
 * Default API URL from environment variables or localhost
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000/';

// Track interceptor IDs
let requestInterceptorId: number | null = null;
let responseInterceptorId: number | null = null;

/**
 * Creates base service with common functionality for all API services
 * @returns Object containing HTTP client and utility methods
 */
export const createBaseService = () => {
  const { axiosInstance, request } = createHttpClient(API_URL);

  // Remove existing interceptors if they exist
  if (requestInterceptorId !== null) {
    axiosInstance.interceptors.request.eject(requestInterceptorId);
  }
  if (responseInterceptorId !== null) {
    axiosInstance.interceptors.response.eject(responseInterceptorId);
  }

  // Setup authentication interceptor
  requestInterceptorId = axiosInstance.interceptors.request.use(
    config => {
      const token = tokenService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Setup response interceptor
  responseInterceptorId = axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        tokenService.clearToken();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  /**
   * Builds URL query parameters string from object
   * @param params - Object containing query parameters
   * @returns URL-encoded query string
   * @example
   * buildQueryParams({ search: "test", page: 1 }) // returns "search=test&page=1"
   */
  const buildQueryParams = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  };

  return {
    axiosInstance,
    request,
    buildQueryParams,
  };
};
