import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { CreateUserPayload, UpdateUserPayload } from '@/types/user';

/**
 * Query key for users data caching
 */
export const USERS_QUERY_KEY = ['users'] as const;

/**
 * Custom hook for managing users data and operations
 * Provides functionality for fetching, creating, updating, and deleting users
 *
 * @param search - Search term for filtering users
 * @returns Object containing query and mutation functions
 */
export function useUsers(search: string) {
  const queryClient = useQueryClient();

  /**
   * Infinite query for fetching paginated users data
   * Supports search functionality and cursor-based pagination
   */
  const query = useInfiniteQuery({
    queryKey: [...USERS_QUERY_KEY, search],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => userService.getUsers(search, 10, pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.paging.hasMore ? lastPage.paging.cursor : undefined),
  });

  /**
   * Mutation for creating new user
   * Invalidates users query cache on success
   */
  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });

  /**
   * Mutation for updating existing user
   * Invalidates users query cache on success
   */
  const updateMutation = useMutation({
    mutationFn: ({ username, payload }: { username: string; payload: UpdateUserPayload }) => userService.updateUser(username, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });

  /**
   * Mutation for deleting user
   * Invalidates users query cache on success
   */
  const deleteMutation = useMutation({
    mutationFn: (username: string) => userService.deleteUser(username),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
