import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transaction.service';
import { CreateTransactionPayload, SalesByDateRangeParams } from '@/types/transaction';

/**
 * Query keys for transaction data caching
 */
export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const;
export const TRANSACTION_STATS_QUERY_KEY = ['transaction-stats'] as const;

/**
 * Custom hook for managing transactions data and operations
 * Provides functionality for fetching and creating transactions
 *
 * @param size - Number of items per page
 * @returns Object containing query and mutation functions
 *
 * @example
 * const { query, createMutation } = useTransactions(10)
 * // Fetch transactions
 * const transactions = query.data?.pages.flatMap(page => page.data)
 * // Create transaction
 * await createMutation.mutateAsync({
 *   customer_name: "John",
 *   total_amount: 50000,
 *   payment_method_id: 1,
 *   transaction_items: [...]
 * })
 */
export function useTransactions(size: number = 10) {
  const queryClient = useQueryClient();

  /**
   * Infinite query for fetching paginated transactions data
   * Uses transaction_id as cursor for pagination
   */
  const query = useInfiniteQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      transactionService.getTransactions({
        size,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: lastPage => (lastPage.paging.hasMore ? lastPage.data[lastPage.data.length - 1].transaction_id : undefined),
  });

  /**
   * Mutation for creating new transaction
   * Invalidates both transactions and stats queries on success
   *
   * @example
   * await createMutation.mutateAsync({
   *   customer_name: "John",
   *   total_amount: 50000,
   *   payment_method_id: 1,
   *   transaction_items: [...]
   * })
   */
  const createMutation = useMutation({
    mutationFn: (payload: CreateTransactionPayload) => transactionService.createTransaction(payload),
    onSuccess: () => {
      // Invalidate all transaction related queries
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TRANSACTION_STATS_QUERY_KEY });
    },
  });

  return {
    query,
    createMutation,
  };
}

/**
 * Custom hook for fetching transaction statistics
 * Provides various metrics about transactions
 *
 * @returns Object containing queries for different stats
 *
 * @example
 * const { todaySalesQuery, averageQuery } = useTransactionStats()
 * console.log(todaySalesQuery.data?.data) // Today's total sales
 * console.log(averageQuery.data?.data) // Average transaction amount
 */
export function useTransactionStats() {
  /**
   * Query for today's total sales amount
   */
  const todaySalesQuery = useQuery({
    queryKey: [...TRANSACTION_STATS_QUERY_KEY, 'today-sales'],
    queryFn: () => transactionService.getTodaySales(),
  });

  /**
   * Query for today's transaction count
   */
  const todayCountQuery = useQuery({
    queryKey: [...TRANSACTION_STATS_QUERY_KEY, 'today-count'],
    queryFn: () => transactionService.getTodayTransactionCount(),
  });

  /**
   * Query for average transaction amount
   */
  const averageQuery = useQuery({
    queryKey: [...TRANSACTION_STATS_QUERY_KEY, 'average'],
    queryFn: () => transactionService.getAverageTransaction(),
  });

  /**
   * Query for last 7 days sales data
   */
  const last7DaysQuery = useQuery({
    queryKey: [...TRANSACTION_STATS_QUERY_KEY, 'last-7-days'],
    queryFn: () => transactionService.getLast7DaysSales(),
  });

  return {
    todaySalesQuery,
    todayCountQuery,
    averageQuery,
    last7DaysQuery,
  };
}

/**
 * Custom hook for fetching sales data within a date range
 *
 * @param params - Date range parameters
 * @returns Query result containing sales data
 *
 * @example
 * const query = useSalesByDateRange({
 *   from: "2024-01-01",
 *   to: "2024-01-31"
 * })
 * console.log(query.data?.data) // Sales data for January
 */
export function useSalesByDateRange(params: SalesByDateRangeParams) {
  return useQuery({
    queryKey: [...TRANSACTION_STATS_QUERY_KEY, 'sales-by-date', params.from, params.to],
    queryFn: () => transactionService.getSalesByDateRange(params),
    staleTime: 0, // Always fetch fresh data
  });
}
