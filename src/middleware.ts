import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken, UserRole } from './types/auth';

/**
 * Configuration for route protection and access control
 */

// Routes that require authentication
const protectedRoutes = ['/admin', '/cashier'];

// Public routes that should handle redirection logic
const publicRoutes = ['/', '/login'];

// Role-based route access mapping
const roleRoutes: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['/admin'],
  [UserRole.CASHIER]: ['/cashier'],
};

/**
 * Validates and decodes a JWT token
 * @param token - JWT token to validate
 * @returns Object containing validation status and decoded token if valid
 */
const isTokenValid = (token: string): { isValid: boolean; decoded?: DecodedToken } => {
  try {
    const decoded = jwtDecode(token) as DecodedToken;
    const currentTime = Math.floor(Date.now() / 1000);

    if (decoded.exp < currentTime) {
      return { isValid: false };
    }

    return { isValid: true, decoded };
  } catch (error) {
    console.error('[Auth] Token validation error:', error);
    return { isValid: false };
  }
};

/**
 * Checks if a user has access to a specific route based on their role
 * @param role - User's role
 * @param pathname - Route path to check
 * @returns boolean indicating access permission
 */
const hasAccess = (role: UserRole, pathname: string): boolean => {
  const allowedRoutes = roleRoutes[role] || [];
  return allowedRoutes.some(route => pathname.startsWith(route));
};

/**
 * Next.js Middleware for Authentication and Authorization
 *
 * Handles:
 * 1. Route protection
 * 2. JWT token validation
 * 3. Role-based access control
 * 4. Redirection logic
 *
 * Flow:
 * - For public routes: Redirects authenticated users to their role-specific dashboard
 * - For protected routes: Validates authentication and role-based access
 * - For invalid/expired tokens: Redirects to login
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Handle public routes (/, /login)
  if (publicRoutes.includes(pathname)) {
    if (refreshToken) {
      const { isValid, decoded } = isTokenValid(refreshToken);
      if (isValid && decoded) {
        // Redirect authenticated users to their dashboard
        const redirectUrl = roleRoutes[decoded.role][0];
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }
    }

    // Redirect root to login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Redirect to login if no token exists
    if (!refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { isValid, decoded } = isTokenValid(refreshToken);

    // Redirect to login if token is invalid
    if (!isValid || !decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Redirect to user's dashboard if they don't have access to the requested route
    if (!hasAccess(decoded.role, pathname)) {
      const redirectUrl = roleRoutes[decoded.role][0];
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

/**
 * Middleware configuration
 * Matches all paths except static assets and API routes
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
