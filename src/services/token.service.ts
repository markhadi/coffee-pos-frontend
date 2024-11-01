import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/auth';

/**
 * Constants for token management
 */
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const EXPIRY_THRESHOLD = 60; // seconds before expiry to consider token as expiring

/**
 * Service for managing authentication tokens
 * Handles token storage, retrieval, and validation
 */
export const tokenService = {
  /**
   * Retrieves token from local storage
   * @returns Stored token or null if not found
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Stores token and decoded user data in local storage
   * @param token - JWT token string
   */
  setToken: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    const decoded = tokenService.decodeToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(decoded));
  },

  /**
   * Removes token and user data from local storage
   */
  clearToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Decodes JWT token to access payload data
   * @param token - JWT token string
   * @returns Decoded token payload
   * @throws Error if token format is invalid
   */
  decodeToken: (token: string): DecodedToken => {
    try {
      return jwtDecode(token) as DecodedToken;
    } catch {
      throw new Error('Invalid token format');
    }
  },

  /**
   * Checks if current token is approaching expiration
   * @returns true if token is expired or will expire soon
   */
  isTokenExpiringSoon: (): boolean => {
    const token = tokenService.getToken();
    if (!token) return true;

    try {
      const decoded = tokenService.decodeToken(token);
      const timeUntilExp = decoded.exp - Math.floor(Date.now() / 1000);
      return timeUntilExp <= EXPIRY_THRESHOLD;
    } catch {
      return true;
    }
  },
};
