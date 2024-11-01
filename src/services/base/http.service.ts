import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api';

/**
 * Creates an HTTP client with pre-configured axios instance
 * @param baseURL - Base URL for API requests
 * @returns Object containing axios instance and request method
 */
export const createHttpClient = (baseURL: string) => {
  /**
   * Axios instance with default configuration
   */
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  /**
   * Handles API errors and throws standardized ApiError
   * @param error - Axios error object
   * @throws {ApiError} Standardized API error with status and message
   */
  const handleError = (error: AxiosError): never => {
    if (!navigator.onLine) throw new ApiError('No internet connection');

    const status = error.response?.status;
    const message = getErrorMessage(status);

    throw new ApiError(message, status, error.response?.data);
  };

  /**
   * Maps HTTP status codes to user-friendly error messages
   * @param status - HTTP status code
   * @returns Appropriate error message for the status code
   */
  const getErrorMessage = (status?: number): string => {
    switch (status) {
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error';
      default:
        return 'An unexpected error occurred';
    }
  };

  /**
   * Makes HTTP requests with error handling
   * @param config - Axios request configuration
   * @returns Promise resolving to response data
   * @throws {ApiError} When request fails
   */
  const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance(config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleError(error);
      }
      throw error;
    }
  };

  return {
    axiosInstance,
    request,
  };
};
