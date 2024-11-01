import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { ApiError } from '@/types/api';

/**
 * Interface for standardized API error responses
 */
interface ErrorResponse {
  errors: string | Record<string, string[]>;
  message?: string;
}

/**
 * Creates an HTTP client for making API requests
 * Provides standardized error handling and response formatting
 *
 * @param baseURL - Base URL for all API requests
 * @returns Object containing configured axios instance and request method
 *
 * @example
 * const { request } = createHttpClient('https://api.example.com')
 * const data = await request({ method: 'GET', url: '/users' })
 */
export const createHttpClient = (baseURL: string) => {
  /**
   * Configured axios instance with default settings
   * Includes timeout, credentials, and content type headers
   */
  const axiosInstance: AxiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
  });

  /**
   * Standardizes error handling across all API requests
   * Converts axios errors to ApiError format with consistent messaging
   *
   * @param error - Original axios error
   * @throws {ApiError} Standardized error with message and status
   *
   * @example
   * try {
   *   await request()
   * } catch (error) {
   *   handleError(error) // throws "Username already exists" with status 400
   * }
   */
  const handleError = (error: AxiosError<ErrorResponse>): never => {
    if (!navigator.onLine) throw new ApiError('No internet connection');

    const status = error.response?.status;
    const errorData = error.response?.data;

    // Extract error message from response
    let message: string;
    if (typeof errorData?.errors === 'string') {
      message = errorData.errors;
    } else if (typeof errorData?.message === 'string') {
      message = errorData.message;
    } else {
      message = getErrorMessage(status);
    }

    console.error('API Error Details:', {
      status,
      message,
      data: error.response?.data,
      config: error.config,
    });

    throw new ApiError(message, status, error.response?.data);
  };

  /**
   * Maps HTTP status codes to user-friendly messages
   * Provides consistent error messaging across the application
   *
   * @param status - HTTP status code
   * @returns Human-readable error message
   */
  const getErrorMessage = (status?: number): string => {
    switch (status) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized access';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 409:
        return 'Data conflict';
      case 500:
        return 'Server error';
      default:
        return 'An unexpected error occurred';
    }
  };

  /**
   * Makes HTTP requests with automatic error handling
   * Handles different response formats based on endpoint type
   *
   * @param config - Request configuration
   * @returns Promise resolving to response data
   * @throws {ApiError} When request fails
   *
   * @example
   * // GET users with pagination
   * const users = await request({
   *   method: 'GET',
   *   url: '/users',
   *   params: { page: 1 }
   * })
   */
  const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance(config);

      // Handle different response formats based on endpoint
      if (config.url?.includes('login')) {
        return response.data;
      } else if ((config.url?.includes('users') || config.url?.includes('categories') || config.url?.includes('payments')) && config.method === 'GET') {
        // Return full response for GET requests to users, categories, and payments
        return response.data;
      } else if (config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE') {
        // For mutations, return the data property
        return response.data.data;
      } else {
        // Default fallback
        return response.data.data || response.data;
      }
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
