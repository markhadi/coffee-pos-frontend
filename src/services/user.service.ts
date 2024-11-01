import { CreateUserPayload, UpdateUserPayload, UserListResponse, UserResponse } from '@/types/user';
import { createBaseService } from './base/base.service';

/**
 * Get base service utilities for making HTTP requests
 */
const { request, buildQueryParams } = createBaseService();

/**
 * Service for managing user-related API operations
 * Provides functionality for CRUD operations on users
 */
export const userService = {
  /**
   * Fetches paginated list of users
   * Supports search functionality and cursor-based pagination
   *
   * @param search - Search term to filter users
   * @param size - Number of items per page
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to paginated user list
   * @throws {ApiError} When fetching fails
   *
   * @example
   * // Fetch first page
   * const firstPage = await getUsers('', 10)
   * // Fetch next page
   * const nextPage = await getUsers('', 10, firstPage.paging.cursor)
   */
  getUsers: async (search: string = '', size: number = 10, cursor?: number): Promise<UserListResponse> => {
    const validSize = Math.max(1, size);

    const params = buildQueryParams({
      search,
      size: validSize,
      ...(cursor ? { cursor: cursor.toString() } : {}),
    });

    return request<UserListResponse>({
      method: 'GET',
      url: `/api/users${params ? `?${params}` : ''}`,
    });
  },

  /**
   * Creates a new user in the system
   *
   * @param payload - User creation data
   * @returns Promise resolving to created user data
   * @throws {ApiError} When username exists or validation fails
   *
   * @example
   * const newUser = await createUser({
   *   username: 'john_doe',
   *   password: 'secure123',
   *   name: 'John Doe',
   *   role: 'CASHIER'
   * })
   */
  createUser: async (payload: CreateUserPayload): Promise<UserResponse> => {
    return request<UserResponse>({
      method: 'POST',
      url: '/api/users',
      data: payload,
    });
  },

  /**
   * Updates an existing user's information
   *
   * @param username - Username of user to update
   * @param payload - Updated user data
   * @returns Promise resolving to updated user data
   * @throws {ApiError} When user not found or validation fails
   *
   * @example
   * const updatedUser = await updateUser('john_doe', {
   *   name: 'John Updated',
   *   role: 'ADMIN'
   * })
   */
  updateUser: async (username: string, payload: UpdateUserPayload): Promise<UserResponse> => {
    return request<UserResponse>({
      method: 'PUT',
      url: `/api/users/${username}`,
      data: payload,
    });
  },

  /**
   * Deletes a user from the system
   *
   * @param username - Username of user to delete
   * @returns Promise resolving to deleted user data
   * @throws {ApiError} When user not found or deletion fails
   *
   * @example
   * const deletedUser = await deleteUser('john_doe')
   */
  deleteUser: async (username: string): Promise<UserResponse> => {
    return request<UserResponse>({
      method: 'DELETE',
      url: `/api/users/${username}`,
    });
  },
};
