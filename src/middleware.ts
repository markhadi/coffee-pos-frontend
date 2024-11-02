import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken, UserRole } from './types/auth';

/**
 * Routes that require authentication
 * Any route in this array will be protected by the middleware
 */
const protectedRoutes = ['/admin', '/cashier'];

/**
 * Routes that should redirect to login
 * Root path should redirect to login if not authenticated
 */
const publicRoutes = ['/', '/login'];

/**
 * Mapping of user roles to their allowed routes
 * Defines which routes each role has access to
 */
const roleRoutes: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['/admin'],
  [UserRole.CASHIER]: ['/cashier'],
};

/**
 * Validates JWT token and decodes it
 * @param token - JWT token string
 * @returns Object containing validation result and decoded token
 */
const isTokenValid = (token: string): { isValid: boolean; decoded?: DecodedToken } => {
  try {
    const decoded = jwtDecode(token) as DecodedToken;
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      return { isValid: false };
    }

    return { isValid: true, decoded };
  } catch {
    return { isValid: false };
  }
};

/**
 * Checks if user has access to requested route based on their role
 * @param role - User's role
 * @param pathname - Requested route path
 * @returns boolean indicating if user has access
 */
const hasAccess = (role: UserRole, pathname: string): boolean => {
  const allowedRoutes = roleRoutes[role] || [];
  return allowedRoutes.some(route => pathname.startsWith(route));
};

/**
 * Middleware function to handle authentication and authorization
 * - Protects specified routes
 * - Validates JWT tokens
 * - Handles role-based access control
 * - Manages redirects for unauthorized access
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get refresh_token from cookies for server-side auth
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    if (refreshToken) {
      // Use refresh token to check authentication status
      const { isValid, decoded } = isTokenValid(refreshToken);
      if (isValid && decoded) {
        const redirectUrl = roleRoutes[decoded.role][0];

        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Validate refresh token for protected routes
    const { isValid, decoded } = isTokenValid(refreshToken);
    if (!isValid || !decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role-based access
    if (!hasAccess(decoded.role, pathname)) {
      const redirectUrl = roleRoutes[decoded.role][0];

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Middleware configuration
 * Include root path in matcher
 */
export const config = {
  matcher: ['/', '/login', '/admin/:path*', '/cashier/:path*'],
};
