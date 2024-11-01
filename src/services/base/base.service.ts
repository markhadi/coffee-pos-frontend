import { createHttpClient } from './http.service';

/**
 * Default API URL from environment variables or localhost
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000/';

/**
 * Creates base service with common functionality for all API services
 * @returns Object containing HTTP client and utility methods
 */
export const createBaseService = () => {
  const { axiosInstance, request } = createHttpClient(API_URL);

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
