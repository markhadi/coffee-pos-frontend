import { createBaseService } from './base/base.service';
import { tokenService } from './token.service';
import { LoginSchema, LoginResponse } from '@/types/auth';
import { ApiError } from '@/types/api';

/**
 * Creates authentication service with login, logout, and token refresh functionality
 * @returns Authentication service methods
 */
const createAuthService = () => {
  const { request, axiosInstance } = createBaseService();

  /**
   * Sets up axios interceptors for request/response handling
   * Manages authentication headers and token refresh
   */
  const setupRefreshInterceptor = () => {
    axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('refresh')) {
          originalRequest._retry = true;
          try {
            const newToken = await refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            await logout();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  };

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
    });

    if (response.data) {
      tokenService.setToken(response.data);
      setCookie(response.data);
    }

    return response;
  };

  /**
   * Refreshes authentication token
   * @returns Promise resolving to new token
   * @throws Error if refresh fails
   */
  const refreshToken = async (): Promise<string> => {
    const response = await request<LoginResponse>({
      method: 'GET',
      url: 'api/users/refresh',
    });

    if (response.data) {
      tokenService.setToken(response.data);
      setCookie(response.data);
      return response.data;
    }

    throw new Error('Invalid refresh token response');
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
      }).catch(() => {
        /* Ignore logout errors */
      });
    }

    tokenService.clearToken();
    clearCookie();
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  };

  /**
   * Sets authentication cookie
   * @param token - JWT token string
   */
  const setCookie = (token: string): void => {
    document.cookie = `token=${token}; path=/; max-age=${60 * 15}`;
  };

  /**
   * Clears authentication cookie
   */
  const clearCookie = (): void => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  };

  // Initialize interceptors
  setupRefreshInterceptor();

  return {
    login,
    logout,
    refreshToken,
  };
};

export const authService = createAuthService();
export { ApiError as AuthError };
