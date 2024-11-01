import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { CreateProductPayload, UpdateProductPayload, ProductSearchParams } from '@/types/product';

/**
 * Query key for products data caching
 */
export const PRODUCTS_QUERY_KEY = ['products'] as const;

/**
 * Custom hook for managing products data and operations
 * Provides functionality for fetching, creating, updating, and deleting products
 *
 * @param search - Search term for filtering products
 * @returns Object containing query and mutation functions
 *
 * @example
 * const { query, createMutation } = useProducts('')
 * // Fetch products
 * const products = query.data?.pages.flatMap(page => page.data)
 * // Create product
 * await createMutation.mutateAsync({
 *   code: "PROD001",
 *   name: "Espresso",
 *   stock: 100,
 *   price: 25000,
 *   category_id: 1
 * })
 */
export function useProducts(search: string) {
  const queryClient = useQueryClient();

  /**
   * Infinite query for fetching paginated products data
   * Supports search functionality and cursor-based pagination
   */
  const query = useInfiniteQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, search],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      productService.getProducts({
        search,
        size: 10,
        cursor: pageParam,
      } as ProductSearchParams),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.paging.hasMore ? lastPage.paging.cursor : undefined),
  });

  /**
   * Mutation for creating new product
   * Invalidates products query cache on success
   *
   * @example
   * await createMutation.mutateAsync({
   *   code: "PROD001",
   *   name: "Espresso",
   *   stock: 100,
   *   price: 25000,
   *   category_id: 1
   * })
   */
  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => productService.createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });

  /**
   * Mutation for updating existing product
   * Invalidates products query cache on success
   *
   * @example
   * await updateMutation.mutateAsync({
   *   id: 1,
   *   payload: {
   *     name: "Espresso Large",
   *     price: 30000
   *   }
   * })
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateProductPayload }) => productService.updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });

  /**
   * Mutation for deleting product
   * Invalidates products query cache on success
   *
   * @example
   * await deleteMutation.mutateAsync(1)
   */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
