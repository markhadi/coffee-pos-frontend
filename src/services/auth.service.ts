import axios, { AxiosError, AxiosInstance } from 'axios';
import { LoginSchema, LoginResponse, DecodedToken } from '@/types/auth';
import { jwtDecode } from 'jwt-decode';

/**
 * API Configuration
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:2000/';
const TOKEN_EXPIRY_THRESHOLD = 60; // Check token 1 minute before expiry

/**
 * Axios instance for authenticated requests
 * Includes default configuration for API calls
 */
const axiosJWT: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Custom error class for authentication related errors
 */
export class AuthError extends Error {
  constructor(public message: string, public status?: number, public data?: any) {
    super(message);
  }
}

/**
 * Authentication Service
 * Handles all authentication related operations including:
 * - Login
 * - Logout
 * - Token refresh
 * - Request interception
 * - Token management
 */
export const authService = {
  /**
   * Sets up axios interceptors for request/response handling
   * Manages token refresh and authentication headers
   */
  setupInterceptors() {
    this.setupExpirationTimer();

    // Add token to all requests
    axiosJWT.interceptors.request.use(
      async config => {
        const token = localStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      error => Promise.reject(error)
    );

    // Handle 401 responses and token refresh
    axiosJWT.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('refresh')) {
          originalRequest._retry = true;
          try {
            const newToken = await this.refreshToken();
            localStorage.setItem('token', newToken);
            axiosJWT.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosJWT(originalRequest);
          } catch (refreshError) {
            this.logout();
            throw refreshError;
          }
        }
        return Promise.reject(error);
      }
    );
  },

  /**
   * Sets up timer to check token expiration
   * Automatically refreshes token when approaching expiration
   */
  setupExpirationTimer() {
    if (window._tokenCheckInterval) clearInterval(window._tokenCheckInterval);

    window._tokenCheckInterval = setInterval(() => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const decoded = JSON.parse(user) as DecodedToken;
          const timeUntilExp = decoded.exp - Math.floor(Date.now() / 1000);

          if (timeUntilExp <= TOKEN_EXPIRY_THRESHOLD) {
            this.refreshToken()
              .then(newToken => {
                const newDecoded = this.decodeToken(newToken);
                localStorage.setItem('token', newToken);
                localStorage.setItem('user', JSON.stringify(newDecoded));
              })
              .catch(() => this.logout());
          }
        } catch (error) {
          this.logout();
        }
      }
    }, 30000); // Check every 30 seconds
  },

  /**
   * Handles user login
   * @param credentials - User credentials (username and password)
   * @returns LoginResponse
   */
  async login(credentials: LoginSchema): Promise<LoginResponse> {
    try {
      const response = await axiosJWT.post<LoginResponse>('api/users/login', credentials);
      if (!response.data?.data) throw new AuthError('Invalid response format from server');

      // Store token in both cookie and localStorage
      document.cookie = `token=${response.data.data}; path=/; max-age=${60 * 15}`; // 15 minutes
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new AuthError(this.getErrorMessage(error), error.response?.status, error.response?.data);
      }
      throw new AuthError('An unexpected error occurred');
    }
  },

  /**
   * Refreshes the authentication token
   * @returns Promise<string> New token
   */
  async refreshToken(): Promise<string> {
    try {
      const response = await axios.get<LoginResponse>(`${API_URL}api/users/refresh`, {
        withCredentials: true,
      });

      if (!response.data?.data) throw new AuthError('Invalid refresh token response');

      document.cookie = `token=${response.data.data}; path=/; max-age=${60 * 15}`;
      return response.data.data;
    } catch (error) {
      this.logout();
      throw new AuthError('Failed to refresh token');
    }
  },

  /**
   * Handles user logout
   * Clears all authentication data and redirects to login
   */
  async logout() {
    try {
      if (window._tokenCheckInterval) clearInterval(window._tokenCheckInterval);

      const token = localStorage.getItem('token');
      if (token) {
        await axios
          .delete(`${API_URL}api/users/logout`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => {
            /* Ignore logout API errors */
          });
      }
    } finally {
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
  },

  /**
   * Generates error messages based on API response
   */
  getErrorMessage(error: AxiosError): string {
    if (!navigator.onLine) return 'No internet connection';

    switch (error.response?.status) {
      case 401:
        return 'Invalid username or password';
      case 404:
        return 'Login service not available';
      case 403:
        return 'Access forbidden';
      case 500:
        return 'Server error. Please try again later';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  },

  /**
   * Decodes JWT token
   * @param token - JWT token string
   * @returns DecodedToken
   */
  decodeToken(token: string): DecodedToken {
    try {
      return jwtDecode(token) as DecodedToken;
    } catch (error) {
      throw new AuthError('Invalid token format');
    }
  },

  /**
   * Checks if token is expired
   * @param token - JWT token string
   * @returns boolean
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      return decoded.exp < Math.floor(Date.now() / 1000);
    } catch {
      return true;
    }
  },

  /**
   * Makes authenticated API requests
   * Handles token refresh and request retry
   */
  async authenticatedRequest<T>(config: { method: 'get' | 'post' | 'put' | 'delete'; url: string; data?: any; timeout?: number }): Promise<T> {
    const token = localStorage.getItem('token');
    if (!token) throw new AuthError('Authentication required');

    try {
      const response = await axiosJWT({
        ...config,
        timeout: config.timeout || 10000,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please check your connection.');
        }
        if (error.response?.status === 401) {
          try {
            const newToken = await this.refreshToken();
            const retryResponse = await axiosJWT({
              ...config,
              headers: { Authorization: `Bearer ${newToken}` },
            });
            return retryResponse.data;
          } catch {
            this.logout();
            throw new AuthError('Session expired. Please login again.');
          }
        }
      }
      throw error;
    }
  },
};

// Global type declaration for token check interval
declare global {
  interface Window {
    _tokenCheckInterval?: NodeJS.Timeout;
  }
}
