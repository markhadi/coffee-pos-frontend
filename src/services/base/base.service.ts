import { axiosInstance, request } from '../auth.service';
import { tokenService } from '../token.service';

/**
 * Creates base service with common functionality for all API services
 * Provides request interceptor for token management and utility methods
 */
export const createBaseService = () => {
  /**
   * Request interceptor to automatically add authentication token
   * Adds Authorization header with bearer token if available
   */
  axiosInstance.interceptors.request.use(
    config => {
      // Enable credentials for all requests (needed for cookies)
      config.withCredentials = true;

      // Add Authorization header if token exists
      const token = tokenService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  /**
   * Builds URL query parameters string from object
   * @param params - Object containing query parameters
   * @returns URL-encoded query string
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
