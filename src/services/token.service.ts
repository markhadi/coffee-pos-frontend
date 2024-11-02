import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from '@/types/auth';

const EXPIRY_THRESHOLD = 60; // seconds

class TokenService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  decodeToken(token: string): DecodedToken {
    try {
      return jwtDecode(token) as DecodedToken;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  isTokenExpiringSoon(): boolean {
    if (!this.token) return true;

    try {
      const decoded = this.decodeToken(this.token);
      const timeUntilExp = decoded.exp - Math.floor(Date.now() / 1000);
      return timeUntilExp <= EXPIRY_THRESHOLD;
    } catch {
      return true;
    }
  }
}

export const tokenService = new TokenService();
