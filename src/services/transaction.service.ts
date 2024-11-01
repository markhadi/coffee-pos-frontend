import { format } from 'date-fns';
import { createBaseService } from './base/base.service';
import {
  CreateTransactionPayload,
  Transaction,
  TodaySalesResponse,
  TodayTransactionCountResponse,
  AverageTransactionResponse,
  Last7DaysSalesResponse,
  TransactionListResponse,
  SalesByDateRangeResponse,
  TransactionListParams,
  SalesByDateRangeParams,
  SalesByDateRangeItem,
} from '@/types/transaction';

/**
 * Get base service utilities for making HTTP requests
 */
const { request, buildQueryParams } = createBaseService();

/**
 * Service for managing transaction-related API operations
 * Provides functionality for creating transactions and retrieving sales data
 */
export const transactionService = {
  /**
   * Creates a new transaction in the system
   *
   * @param payload - Transaction creation data
   * @returns Promise resolving to created transaction
   * @throws {ApiError} When validation fails
   *
   * @example
   * const newTransaction = await createTransaction({
   *   customer_name: "John",
   *   total_amount: 50000,
   *   payment_method_id: 1,
   *   transaction_items: [...]
   * })
   */
  createTransaction: async (payload: CreateTransactionPayload): Promise<Transaction> => {
    return request<Transaction>({
      method: 'POST',
      url: '/api/transactions',
      data: payload,
    });
  },

  /**
   * Fetches total sales amount for today
   *
   * @returns Promise resolving to today's sales amount
   * @throws {ApiError} When fetching fails
   *
   * @example
   * const todaySales = await getTodaySales()
   * console.log(todaySales.data) // 1000000
   */
  getTodaySales: async (): Promise<TodaySalesResponse> => {
    return request<TodaySalesResponse>({
      method: 'GET',
      url: '/api/transactions/today-sales',
    });
  },

  /**
   * Fetches number of transactions for today
   *
   * @returns Promise resolving to today's transaction count
   * @throws {ApiError} When fetching fails
   *
   * @example
   * const count = await getTodayTransactionCount()
   * console.log(count.data) // 50
   */
  getTodayTransactionCount: async (): Promise<TodayTransactionCountResponse> => {
    return request<TodayTransactionCountResponse>({
      method: 'GET',
      url: '/api/transactions/today-count',
    });
  },

  /**
   * Fetches average transaction amount
   *
   * @returns Promise resolving to average transaction amount
   * @throws {ApiError} When fetching fails
   *
   * @example
   * const average = await getAverageTransaction()
   * console.log(average.data) // 25000
   */
  getAverageTransaction: async (): Promise<AverageTransactionResponse> => {
    return request<AverageTransactionResponse>({
      method: 'GET',
      url: '/api/transactions/average',
    });
  },

  /**
   * Fetches sales data for last 7 days
   *
   * @returns Promise resolving to daily sales data
   * @throws {ApiError} When fetching fails
   *
   * @example
   * const sales = await getLast7DaysSales()
   * console.log(sales.data) // [{ date: "2024-01-01", totalSale: 1000000 }, ...]
   */
  getLast7DaysSales: async (): Promise<Last7DaysSalesResponse> => {
    return request<Last7DaysSalesResponse>({
      method: 'GET',
      url: '/api/transactions/last-7-days-sales',
    });
  },

  /**
   * Fetches paginated list of transactions
   * Supports cursor-based pagination
   *
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated transaction list
   * @throws {ApiError} When fetching fails
   *
   * @example
   * const firstPage = await getTransactions({ size: 10 })
   * const nextPage = await getTransactions({
   *   size: 10,
   *   cursor: firstPage.paging.cursor
   * })
   */
  getTransactions: async ({ size, cursor }: TransactionListParams): Promise<TransactionListResponse> => {
    const params = buildQueryParams({
      size: size.toString(),
      ...(cursor ? { cursor } : {}),
    });

    return request<TransactionListResponse>({
      method: 'GET',
      url: `/api/transactions${params ? `?${params}` : ''}`,
    });
  },

  /**
   * Fetches and transforms sales data for a date range
   * Groups transactions by date and calculates daily totals
   *
   * @param params - Date range parameters
   * @returns Promise resolving to daily sales data
   * @throws {ApiError} When fetching fails
   *
   * @example
   * const sales = await getSalesByDateRange({
   *   from: "2024-01-01",
   *   to: "2024-01-31"
   * })
   */
  getSalesByDateRange: async ({ from, to }: SalesByDateRangeParams): Promise<SalesByDateRangeResponse> => {
    const params = buildQueryParams({ from, to });

    const response = await request<TransactionListResponse>({
      method: 'GET',
      url: `/api/transactions${params ? `?${params}` : ''}`,
    });

    // Transform transaction list to daily sales data
    const dailySales = new Map<string, SalesByDateRangeItem>();

    // Initialize all dates in range with zero values
    const fromDate = new Date(from);
    const toDate = new Date(to);
    for (let d = fromDate; d <= toDate; d.setDate(d.getDate() + 1)) {
      const dateStr = format(d, 'yyyy-MM-dd');
      dailySales.set(dateStr, {
        date: dateStr,
        numberOfTransactions: 0,
        totalSales: 0,
      });
    }

    // Aggregate transactions by date
    response.data.forEach(transaction => {
      const date = format(new Date(transaction.issued_at), 'yyyy-MM-dd');
      const existing = dailySales.get(date) || {
        date,
        numberOfTransactions: 0,
        totalSales: 0,
      };

      dailySales.set(date, {
        date,
        numberOfTransactions: existing.numberOfTransactions + 1,
        totalSales: existing.totalSales + transaction.total_amount,
      });
    });

    // Sort by date and return
    const data = Array.from(dailySales.values()).sort((a, b) => a.date.localeCompare(b.date));

    return { data };
  },
};
