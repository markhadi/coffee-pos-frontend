/**
 * Represents a category in the system
 * Basic category information used throughout the application
 *
 * @property id - Unique numeric identifier for the category
 * @property name - Display name of the category
 *
 * @example
 * {
 *   id: 1,
 *   name: "Coffee"
 * }
 */
export interface CategoryResponse {
  id: number;
  name: string;
}

/**
 * Response structure for paginated category list
 * Used for API responses that return multiple categories
 *
 * @property data - Array of category objects
 * @property paging - Pagination metadata
 * @property paging.total - Total number of items in current page
 * @property paging.hasMore - Indicates if more items exist
 * @property paging.cursor - Optional cursor for fetching next page
 *
 * @example
 * {
 *   data: [
 *     { id: 1, name: "Coffee" },
 *     { id: 2, name: "Tea" }
 *   ],
 *   paging: {
 *     total: 2,
 *     hasMore: true,
 *     cursor: 123
 *   }
 * }
 */
export interface CategoryListResponse {
  data: CategoryResponse[];
  paging: {
    total: number;
    hasMore: boolean;
    cursor?: number;
  };
}

/**
 * Payload for creating a new category
 * Contains required fields for category creation
 *
 * @property name - Name for the new category (3-50 characters)
 *
 * @example
 * {
 *   name: "Coffee"
 * }
 *
 * @see CategoryFormDialog for validation rules
 */
export interface CreateCategoryPayload {
  name: string;
}

/**
 * Payload for updating an existing category
 * Contains fields that can be updated
 * ID cannot be changed, must be updated through API URL
 *
 * @property name - Updated category name (3-50 characters)
 *
 * @example
 * {
 *   name: "Hot Coffee"
 * }
 *
 * @see CategoryFormDialog for validation rules
 */
export interface UpdateCategoryPayload {
  name: string;
}
