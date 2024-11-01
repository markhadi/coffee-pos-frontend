import { CreatePaymentMethodPayload, UpdatePaymentMethodPayload, PaymentMethodListResponse } from '@/types/payment-method';
import { createBaseService } from './base/base.service';

/**
 * Get base service utilities for making HTTP requests
 */
const { request, buildQueryParams } = createBaseService();

/**
 * Service for managing payment method-related API operations
 * Provides functionality for CRUD operations on payment methods
 */
export const paymentMethodService = {
  /**
   * Fetches all payment methods without pagination
   * Used for dropdown lists and simple displays
   *
   * @returns Promise resolving to list of all payment methods
   * @throws {ApiError} When fetching fails
   *
   * @example
   * const methods = await getAllPaymentMethods()
   */
  getAllPaymentMethods: async (): Promise<PaymentMethodListResponse> => {
    return request<PaymentMethodListResponse>({
      method: 'GET',
      url: '/api/payments/list',
    });
  },

  /**
   * Fetches paginated list of payment methods
   * Supports search functionality and cursor-based pagination
   *
   * @param name - Search term to filter payment methods by name
   * @param size - Number of items per page
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to paginated payment method list
   * @throws {ApiError} When fetching fails
   *
   * @example
   * // Fetch first page
   * const firstPage = await getPaymentMethods('', 10)
   * // Fetch next page with search
   * const nextPage = await getPaymentMethods('cash', 10, firstPage.paging.cursor)
   */
  getPaymentMethods: async (name: string = '', size: number = 10, cursor?: number): Promise<PaymentMethodListResponse> => {
    const validSize = Math.max(1, size);

    const params = buildQueryParams({
      search: name.trim(),
      size: validSize,
      ...(cursor ? { cursor: cursor.toString() } : {}),
    });

    return request<PaymentMethodListResponse>({
      method: 'GET',
      url: `/api/payments${params ? `?${params}` : ''}`,
    });
  },

  /**
   * Creates a new payment method in the system
   *
   * @param payload - Payment method creation data
   * @returns Promise resolving to created payment method
   * @throws {ApiError} When name exists or validation fails
   *
   * @example
   * const newMethod = await createPaymentMethod({
   *   name: 'Credit Card',
   *   description: 'Visa/Mastercard',
   *   is_active: true
   * })
   */
  createPaymentMethod: async (payload: CreatePaymentMethodPayload) => {
    return request({
      method: 'POST',
      url: '/api/payments',
      data: payload,
    });
  },

  /**
   * Updates an existing payment method's information
   *
   * @param id - ID of payment method to update
   * @param payload - Updated payment method data
   * @returns Promise resolving to updated payment method
   * @throws {ApiError} When payment method not found or validation fails
   *
   * @example
   * const updatedMethod = await updatePaymentMethod(1, {
   *   name: 'Updated Credit Card',
   *   is_active: false
   * })
   */
  updatePaymentMethod: async (id: number, payload: UpdatePaymentMethodPayload) => {
    return request({
      method: 'PUT',
      url: `/api/payments/${id}`,
      data: payload,
    });
  },

  /**
   * Deletes a payment method from the system
   *
   * @param id - ID of payment method to delete
   * @returns Promise resolving to deleted payment method
   * @throws {ApiError} When payment method not found or deletion fails
   *
   * @example
   * const deletedMethod = await deletePaymentMethod(1)
   */
  deletePaymentMethod: async (id: number) => {
    return request({
      method: 'DELETE',
      url: `/api/payments/${id}`,
    });
  },
};
