import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSchema, UserRole, DecodedToken } from '@/types/auth';
import { authService, AuthError } from '@/services/auth.service';

/**
 * Route mapping for different user roles
 * Defines which route each role should be redirected to after login
 */
const ROLE_ROUTES = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.CASHIER]: '/cashier',
} as const;

/**
 * Custom hook for handling authentication state and operations
 * Provides login, logout functionality and authentication state management
 */
export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  /**
   * Setup authentication interceptors when component mounts
   * This ensures token refresh and request handling are properly setup
   */
  useEffect(() => {
    authService.setupInterceptors();
  }, []);

  /**
   * Determines the correct route based on user's role
   * @param decodedToken - Decoded JWT token containing user information
   * @returns The route path for the user's role
   * @throws Error if role is invalid
   */
  const handleRouteByRole = (decodedToken: DecodedToken): string => {
    const route = ROLE_ROUTES[decodedToken.role];
    if (!route) {
      console.error('Invalid role detected:', decodedToken.role);
      throw new Error('Invalid role');
    }
    return route;
  };

  /**
   * Handles the login process
   * - Validates credentials
   * - Stores authentication data
   * - Redirects to appropriate route based on role
   *
   * @param credentials - User login credentials
   * @returns Promise<LoginResponse>
   */
  const login = async (credentials: LoginSchema) => {
    try {
      setIsLoading(true);
      setError('');

      // Attempt login
      const response = await authService.login(credentials);
      const token = response.data;
      const decodedToken = authService.decodeToken(token);

      // Store authentication data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(decodedToken));

      // Handle routing
      const route = handleRouteByRole(decodedToken);
      router.push(route);

      return response;
    } catch (error: unknown) {
      // Handle different types of errors
      if (error instanceof AuthError) {
        setError(error.message);
      } else {
        setError('Connection error. Please check your internet connection and try again.');
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user logout
   * Delegates to authService for logout process
   */
  const logout = () => {
    authService.logout();
  };

  return {
    login,
    logout,
    isLoading,
    error,
  };
};
