import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginSchema, UserRole, DecodedToken } from '@/types/auth';
import { authService, AuthError } from '@/services/auth.service';
import { tokenService } from '@/services/token.service';

/**
 * Route mapping for different user roles
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
   * Determines the correct route based on user's role
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
   */
  const login = async (credentials: LoginSchema) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await authService.login(credentials);
      const token = response.data;
      const decodedToken = tokenService.decodeToken(token);

      // Handle routing
      const route = handleRouteByRole(decodedToken);
      router.push(route);

      return response;
    } catch (error) {
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
