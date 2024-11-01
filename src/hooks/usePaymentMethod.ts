import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentMethodService } from '@/services/payment-method.service';
import { CreatePaymentMethodPayload, UpdatePaymentMethodPayload } from '@/types/payment-method';

/**
 * Query key for payment methods data caching
 */
export const PAYMENT_METHODS_QUERY_KEY = ['payment-methods'] as const;

/**
 * Custom hook for managing payment methods data and operations
 * Provides functionality for fetching, creating, updating, and deleting payment methods
 *
 * @param name - Search term for filtering payment methods
 * @returns Object containing query and mutation functions
 *
 * @example
 * const { query, createMutation } = usePaymentMethods('')
 * // Fetch payment methods
 * const methods = query.data?.pages.flatMap(page => page.data)
 * // Create payment method
 * await createMutation.mutateAsync({
 *   name: 'Credit Card',
 *   description: 'Visa/Mastercard',
 *   is_active: true
 * })
 */
export function usePaymentMethods(name: string) {
  const queryClient = useQueryClient();

  /**
   * Infinite query for fetching paginated payment methods data
   * Supports search by name and cursor-based pagination
   */
  const query = useInfiniteQuery({
    queryKey: [...PAYMENT_METHODS_QUERY_KEY, name],
    queryFn: ({ pageParam }: { pageParam: number | undefined }) => paymentMethodService.getPaymentMethods(name, 10, pageParam),
    initialPageParam: 0,
    getNextPageParam: lastPage => (lastPage.paging.hasMore ? lastPage.paging.cursor : undefined),
  });

  /**
   * Mutation for creating new payment method
   * Invalidates payment methods query cache on success
   *
   * @example
   * await createMutation.mutateAsync({
   *   name: 'Credit Card',
   *   description: 'Visa/Mastercard',
   *   is_active: true
   * })
   */
  const createMutation = useMutation({
    mutationFn: (payload: CreatePaymentMethodPayload) => paymentMethodService.createPaymentMethod(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY }),
  });

  /**
   * Mutation for updating existing payment method
   * Invalidates payment methods query cache on success
   *
   * @example
   * await updateMutation.mutateAsync({
   *   id: 1,
   *   payload: {
   *     name: 'Updated Credit Card',
   *     is_active: false
   *   }
   * })
   */
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePaymentMethodPayload }) => paymentMethodService.updatePaymentMethod(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY }),
  });

  /**
   * Mutation for deleting payment method
   * Invalidates payment methods query cache on success
   *
   * @example
   * await deleteMutation.mutateAsync(1)
   */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentMethodService.deletePaymentMethod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_QUERY_KEY }),
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
