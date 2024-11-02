import { createHttpClient } from './base/http.service';
import { tokenService } from './token.service';
import { LoginSchema, LoginResponse } from '@/types/auth';
import { ApiError } from '@/types/api';
import { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Custom configuration interface for axios requests
 * Extends the default axios config with custom properties
 */
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  skipRefreshToken?: boolean; // Flag to skip token refresh for certain requests
  _retry?: boolean; // Flag to prevent infinite retry loops
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000/';

/**
 * Creates an authentication service with token refresh capabilities
 * Handles login, logout, and automatic token refresh
 */
const createAuthService = () => {
  const { axiosInstance, request } = createHttpClient(API_URL);
  let isRefreshing = false; // Flag to prevent multiple simultaneous refresh requests
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  /**
   * Process queued requests after token refresh
   * @param error - Error from token refresh attempt
   * @param token - New token if refresh was successful
   */
  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.resolve(token);
      }
    });
    failedQueue = [];
  };

  /**
   * Response interceptor to handle 401 errors and token refresh
   * Automatically refreshes token and retries failed requests
   */
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async error => {
      const originalRequest = error.config as CustomRequestConfig;

      // Skip refresh for login/refresh requests
      if (originalRequest.skipRefreshToken || originalRequest.url?.includes('refresh')) {
        return Promise.reject(error);
      }

      // Handle 401 errors with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Queue request if refresh is already in progress
        if (isRefreshing) {
          try {
            const token = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshToken();

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);

          await logout();
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }
  );

  /**
   * Authenticates user with credentials
   * @param credentials - User login credentials
   * @returns Promise resolving to login response
   */
  const login = async (credentials: LoginSchema): Promise<LoginResponse> => {
    const response = await request<LoginResponse>({
      method: 'POST',
      url: 'api/users/login',
      data: credentials,
      skipRefreshToken: true,
    } as CustomRequestConfig);

    if (response.data) {
      tokenService.setToken(response.data);
    }

    return response;
  };

  /**
   * Refreshes access token using refresh token from cookie
   * @returns Promise resolving to new access token
   */
  const refreshToken = async (): Promise<string> => {
    try {
      const response = await request<LoginResponse>({
        method: 'GET',
        url: 'api/users/refresh',
        skipRefreshToken: true,
      } as CustomRequestConfig);

      if (response.data) {
        tokenService.setToken(response.data);
        return response.data;
      }

      throw new Error('Invalid refresh token response');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logs out user and cleans up authentication state
   */
  const logout = async (): Promise<void> => {
    const token = tokenService.getToken();

    if (token) {
      await request({
        method: 'DELETE',
        url: 'api/users/logout',
        skipRefreshToken: true,
      } as CustomRequestConfig).catch(error => {
        console.log(error);
      });
    }

    tokenService.clearToken();

    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  return {
    axiosInstance,
    request,
    login,
    logout,
    refreshToken,
  };
};

// Create single instance of auth service
const authServiceInstance = createAuthService();
export const authService = authServiceInstance;
export const { axiosInstance, request } = authServiceInstance;
export { ApiError as AuthError };
