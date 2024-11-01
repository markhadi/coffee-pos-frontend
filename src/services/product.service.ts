import { CreateProductPayload, UpdateProductPayload, ProductListResponse, ProductSearchParams } from '@/types/product';
import { createBaseService } from './base/base.service';

/**
 * Get base service utilities for making HTTP requests
 */
const { request, buildQueryParams } = createBaseService();

/**
 * Service for managing product-related API operations
 * Provides functionality for CRUD operations on products
 */
export const productService = {
  /**
   * Fetches paginated list of products
   * Supports search functionality and cursor-based pagination
   *
   * @param params - Search parameters for filtering products
   * @returns Promise resolving to paginated product list
   * @throws {ApiError} When fetching fails
   *
   * @example
   * // Fetch first page with search
   * const firstPage = await getProducts({
   *   search: 'coffee',
   *   size: 10
   * })
   * // Fetch next page
   * const nextPage = await getProducts({
   *   cursor: firstPage.paging.cursor
   * })
   */
  getProducts: async (params: ProductSearchParams = {}): Promise<ProductListResponse> => {
    const queryParams = buildQueryParams({
      search: params.search?.trim(),
      size: params.size || 10,
      ...(params.cursor ? { cursor: params.cursor.toString() } : {}),
    });

    return request<ProductListResponse>({
      method: 'GET',
      url: `/api/products${queryParams ? `?${queryParams}` : ''}`,
    });
  },

  /**
   * Creates a new product in the system
   *
   * @param payload - Product creation data
   * @returns Promise resolving to created product
   * @throws {ApiError} When validation fails
   *
   * @example
   * const newProduct = await createProduct({
   *   code: "PROD001",
   *   name: "Espresso",
   *   stock: 100,
   *   price: 25000,
   *   category_id: 1
   * })
   */
  createProduct: async (payload: CreateProductPayload) => {
    return request({
      method: 'POST',
      url: '/api/products',
      data: payload,
    });
  },

  /**
   * Updates an existing product's information
   *
   * @param id - ID of product to update
   * @param payload - Updated product data
   * @returns Promise resolving to updated product
   * @throws {ApiError} When product not found or validation fails
   *
   * @example
   * const updatedProduct = await updateProduct(1, {
   *   name: "Espresso Large",
   *   price: 30000
   * })
   */
  updateProduct: async (id: number, payload: UpdateProductPayload) => {
    return request({
      method: 'PUT',
      url: `/api/products/${id}`,
      data: payload,
    });
  },

  /**
   * Deletes a product from the system
   *
   * @param id - ID of product to delete
   * @returns Promise resolving to deleted product
   * @throws {ApiError} When product not found or deletion fails
   *
   * @example
   * const deletedProduct = await deleteProduct(1)
   */
  deleteProduct: async (id: number) => {
    return request({
      method: 'DELETE',
      url: `/api/products/${id}`,
    });
  },
};
