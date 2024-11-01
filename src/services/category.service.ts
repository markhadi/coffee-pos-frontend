import { CreateCategoryPayload, UpdateCategoryPayload, CategoryListResponse, CategoryResponse } from '@/types/category';
import { createBaseService } from './base/base.service';

/**
 * Get base service utilities for making HTTP requests
 */
const { request, buildQueryParams } = createBaseService();

/**
 * Service for managing category-related API operations
 * Provides functionality for CRUD operations on categories
 */
export const categoryService = {
  /**
   * Fetches paginated list of categories
   * Supports search by name and cursor-based pagination
   *
   * @param name - Search term to filter categories by name
   * @param size - Number of items per page
   * @param cursor - Pagination cursor for next page
   * @returns Promise resolving to paginated category list
   * @throws {ApiError} When fetching fails
   *
   * @example
   * // Fetch first page
   * const firstPage = await getCategories('', 10)
   * // Fetch next page
   * const nextPage = await getCategories('', 10, firstPage.paging.cursor)
   */
  getCategories: async (name: string = '', size: number = 10, cursor?: number): Promise<CategoryListResponse> => {
    const validSize = Math.max(1, size);

    const params = buildQueryParams({
      name,
      size: validSize,
      ...(cursor ? { cursor: cursor.toString() } : {}),
    });

    return request<CategoryListResponse>({
      method: 'GET',
      url: `/api/categories${params ? `?${params}` : ''}`,
    });
  },

  /**
   * Creates a new category in the system
   *
   * @param payload - Category creation data
   * @returns Promise resolving to created category data
   * @throws {ApiError} When name exists or validation fails
   *
   * @example
   * const newCategory = await createCategory({
   *   name: 'Electronics'
   * })
   */
  createCategory: async (payload: CreateCategoryPayload): Promise<CategoryResponse> => {
    return request<CategoryResponse>({
      method: 'POST',
      url: '/api/categories',
      data: payload,
    });
  },

  /**
   * Updates an existing category's information
   *
   * @param id - ID of category to update
   * @param payload - Updated category data
   * @returns Promise resolving to updated category data
   * @throws {ApiError} When category not found or validation fails
   *
   * @example
   * const updatedCategory = await updateCategory(1, {
   *   name: 'Updated Electronics'
   * })
   */
  updateCategory: async (id: number, payload: UpdateCategoryPayload): Promise<CategoryResponse> => {
    return request<CategoryResponse>({
      method: 'PUT',
      url: `/api/categories/${id}`,
      data: payload,
    });
  },

  /**
   * Deletes a category from the system
   *
   * @param id - ID of category to delete
   * @returns Promise resolving to deleted category data
   * @throws {ApiError} When category not found or deletion fails
   *
   * @example
   * const deletedCategory = await deleteCategory(1)
   */
  deleteCategory: async (id: number): Promise<CategoryResponse> => {
    return request<CategoryResponse>({
      method: 'DELETE',
      url: `/api/categories/${id}`,
    });
  },
};
