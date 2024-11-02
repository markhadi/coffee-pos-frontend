'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DecodedToken, LoginSchema, UserRole } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { authService, AuthError } from '@/services/auth.service';
import { tokenService } from '@/services/token.service';

interface AuthContextType {
  accessToken: string | null;
  user: DecodedToken | null;
  isLoading: boolean;
  error: string;
  login: (credentials: LoginSchema) => Promise<any>;
  logout: () => void;
}

const ROLE_ROUTES = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.CASHIER]: '/cashier',
} as const;

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  user: null,
  isLoading: false,
  error: '',
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    authService.setOnTokenRefreshed((newToken: string) => {
      const decodedToken = tokenService.decodeToken(newToken);
      setAccessToken(newToken);
      setUser(decodedToken);
    });
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = tokenService.getToken();
      if (token) {
        try {
          const decodedToken = tokenService.decodeToken(token);
          setAccessToken(token);
          setUser(decodedToken);
        } catch (err) {
          console.error('Invalid token:', err);
          logout();
        }
      }
    };

    initAuth();
  }, []);

  const handleRouteByRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin';
      case 'CASHIER':
        return '/cashier';
      default:
        console.error('Invalid role:', role);
        return '/login';
    }
  };

  const login = async (credentials: LoginSchema) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await authService.login(credentials);
      const token = response.data;

      const decodedToken = tokenService.decodeToken(token);
      setAccessToken(token);
      setUser(decodedToken);

      tokenService.setToken(token);

      const redirectPath = handleRouteByRole(decodedToken.role);
      router.push(redirectPath);
    } catch (err) {
      let errorMessage = 'An error occurred during login';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    tokenService.clearToken();
    router.push('/login');
  };

  const value = {
    accessToken,
    user,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
