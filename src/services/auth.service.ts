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
  skipRefreshToken?: boolean;
  _retry?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000/';

/**
 * Creates an authentication service with token refresh capabilities
 */
const createAuthService = () => {
  const { axiosInstance, request } = createHttpClient(API_URL);
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];
  let onTokenRefreshed: ((token: string) => void) | null = null;

  // Fungsi untuk set callback saat token di-refresh
  const setOnTokenRefreshed = (callback: (token: string) => void) => {
    onTokenRefreshed = callback;
  };

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

  axiosInstance.interceptors.request.use(
    config => {
      const token = tokenService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async error => {
      const originalRequest = error.config as CustomRequestConfig;

      if (originalRequest.skipRefreshToken || originalRequest.url?.includes('refresh')) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
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
          tokenService.setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Panggil callback untuk update state user
          if (onTokenRefreshed) {
            onTokenRefreshed(newToken);
          }

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

  const login = async (credentials: LoginSchema): Promise<LoginResponse> => {
    try {
      const response = await request<LoginResponse>({
        method: 'POST',
        url: 'api/users/login',
        data: credentials,
        skipRefreshToken: true,
      } as CustomRequestConfig);

      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('An error occurred during login');
    }
  };

  const refreshToken = async (): Promise<string> => {
    try {
      const response = await request<LoginResponse>({
        method: 'GET',
        url: 'api/users/refresh',
        skipRefreshToken: true,
      } as CustomRequestConfig);

      if (response.data) {
        return response.data;
      }
      throw new Error('Invalid refresh token response');
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    const token = tokenService.getToken();

    if (token) {
      try {
        await request({
          method: 'DELETE',
          url: 'api/users/logout',
          skipRefreshToken: true,
        } as CustomRequestConfig);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    tokenService.clearToken();
  };

  return {
    axiosInstance,
    request,
    login,
    logout,
    refreshToken,
    setOnTokenRefreshed,
  };
};

const authServiceInstance = createAuthService();
export const authService = authServiceInstance;
export const { axiosInstance, request } = authServiceInstance;
export { ApiError as AuthError };
