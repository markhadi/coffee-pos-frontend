import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(4, 'Username must be at least 4 characters').max(100, 'Username must be less than 100 characters'),
  password: z.string().min(4, 'Password must be at least 4 characters').max(100, 'Password must be less than 100 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
}

export interface LoginResponse {
  data: string;
}

export interface JWTPayload {
  userId: string;
  name: string;
  username: string;
  role: UserRole;
  exp: number;
  iat: number;
}

export interface DecodedToken extends JWTPayload {}
