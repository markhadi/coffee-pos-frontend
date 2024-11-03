import { createHttpClient } from './base/http.service';
import { tokenService } from './token.service';
import { LoginSchema, LoginResponse } from '@/types/auth';
import { ApiError } from '@/types/api';
import { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

/**
 * Custom request configuration
 * Extends Axios config with authentication-specific flags
 */
interface CustomRequestConfig extends AxiosRequestConfig {
  skipRefreshToken?: boolean; // Skip token refresh for specific requests (e.g., login)
  _retry?: boolean; // Prevent infinite retry loops during token refresh
}

const API_URL = '';

/**
 * Authentication Service Factory
 * Creates a service to handle authentication operations and token management
 */
const createAuthService = () => {
  const { axiosInstance, request } = createHttpClient(API_URL);
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];

  /**
   * Processes queued requests after token refresh
   * Either resolves with new token or rejects all queued requests
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
   * Response Interceptor
   * Handles automatic token refresh for 401 errors
   */
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async error => {
      const originalRequest = error.config as CustomRequestConfig & InternalAxiosRequestConfig;

      if (originalRequest.skipRefreshToken || originalRequest.url?.includes('refresh')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          });
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
   * Stores token on successful login
   *
   * @param credentials - User login credentials
   * @returns LoginResponse containing user and token data
   * @throws ApiError on authentication failure
   */
  const login = async (credentials: LoginSchema): Promise<LoginResponse> => {
    const response = await request<LoginResponse>({
      method: 'POST',
      url: '/api/users/login',
      data: credentials,
      skipRefreshToken: true,
      withCredentials: true,
    } as CustomRequestConfig);

    if (response.data) {
      tokenService.setToken(response.data);
    }

    return response;
  };

  /**
   * Refreshes access token using refresh token
   * Updates stored token on successful refresh
   *
   * @returns New access token
   * @throws Error on refresh failure
   */
  const refreshToken = async (): Promise<string> => {
    const response = await request<LoginResponse>({
      method: 'GET',
      url: '/api/users/refresh',
      skipRefreshToken: true,
      withCredentials: true,
    } as CustomRequestConfig);

    if (response.data) {
      tokenService.setToken(response.data);
      return response.data;
    }

    throw new Error('Invalid refresh token response');
  };

  /**
   * Logs out user
   * - Attempts server-side logout
   * - Clears local token storage
   * - Redirects to login page
   */
  const logout = async (): Promise<void> => {
    const token = tokenService.getToken();

    if (token) {
      await request({
        method: 'DELETE',
        url: '/api/users/logout',
        skipRefreshToken: true,
      } as CustomRequestConfig).catch(() => {
        // Ignore logout request failures
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

// Singleton instance of auth service
const authServiceInstance = createAuthService();
export const authService = authServiceInstance;
export const { axiosInstance, request } = authServiceInstance;
export { ApiError as AuthError };
