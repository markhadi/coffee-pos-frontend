import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { CreateCategoryPayload, UpdateCategoryPayload } from '@/types/category';

/**
 * Query key for categories data caching
 */
export const CATEGORIES_QUERY_KEY = ['categories'] as const;

/**
 * Custom hook for managing categories data and operations
 * Provides functionality for fetching, creating, updating, and deleting categories
 *
 * @param name - Search term for filtering categories
 * @returns Object containing query and mutation functions
 *
 * @example
 * const { query, createMutation } = useCategories('')
 * // Fetch categories
 * const categories = query.data?.pages.flatMap(page => page.data)
 * // Create category
 * await createMutation.mutateAsync({ name: 'Electronics' })
 */
export function useCategories(name: string) {
  const queryClient = useQueryClient();

  /**
   * Infinite query for fetching paginated categories data
   * Supports search by name and cursor-based pagination
   */
  const query = useInfiniteQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, name],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => categoryService.getCategories(name, 10, pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.paging?.hasMore ? lastPage.paging.cursor : undefined),
  });

  /**
   * Mutation for creating new category
   * Invalidates categories query cache on success
   *
   * @example
   * await createMutation.mutateAsync({ name: 'Electronics' })
   */
  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoryService.createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });

  /**
   * Mutation for updating existing category
   * Invalidates categories query cache on success
   *
   * @example
   * await updateMutation.mutateAsync({
   *   id: 1,
   *   payload: { name: 'Updated Electronics' }
   * })
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCategoryPayload }) => categoryService.updateCategory(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });

  /**
   * Mutation for deleting category
   * Invalidates categories query cache on success
   *
   * @example
   * await deleteMutation.mutateAsync(1)
   */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => categoryService.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY }),
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
