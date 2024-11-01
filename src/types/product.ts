/**
 * Represents a category in the product system
 * Basic category information
 *
 * @property id - Unique numeric identifier
 * @property name - Display name of the category
 */
export interface Category {
  id: number;
  name: string;
}

/**
 * Represents a product in the system
 * Contains product information and metadata
 *
 * @property id - Unique numeric identifier
 * @property code - Unique product code (max 10 chars)
 * @property name - Display name of the product
 * @property stock - Current stock quantity
 * @property price - Product price
 * @property category_id - ID of associated category
 * @property created_at - Timestamp of creation
 * @property updated_at - Timestamp of last update
 * @property created_by_username - Username who created the product
 * @property updated_by_username - Username who last updated the product
 *
 * @example
 * {
 *   id: 1,
 *   code: "PROD001",
 *   name: "Espresso",
 *   stock: 100,
 *   price: 25000,
 *   category_id: 1,
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T00:00:00Z",
 *   created_by_username: "admin",
 *   updated_by_username: "admin"
 * }
 */
export interface Product {
  id: number;
  code: string;
  name: string;
  stock: number;
  price: number;
  category_id: number;
  created_at: string;
  updated_at: string;
  created_by_username: string;
  updated_by_username: string;
}

/**
 * Product with its associated category information
 * Extends Product interface with category details
 *
 * @extends Product
 * @property category - Associated category information
 *
 * @example
 * {
 *   id: 1,
 *   code: "PROD001",
 *   name: "Espresso",
 *   category: {
 *     id: 1,
 *     name: "Coffee"
 *   },
 *   // ... other Product properties
 * }
 */
export interface ProductWithCategory extends Product {
  category: Category;
}

/**
 * Payload for creating a new product
 * Contains required fields for product creation
 *
 * @property code - Unique product code (max 10 chars)
 * @property name - Display name of the product
 * @property stock - Initial stock quantity
 * @property price - Product price
 * @property category_id - ID of associated category
 *
 * @example
 * {
 *   code: "PROD001",
 *   name: "Espresso",
 *   stock: 100,
 *   price: 25000,
 *   category_id: 1
 * }
 */
export interface CreateProductPayload {
  code: string;
  name: string;
  stock: number;
  price: number;
  category_id: number;
}

/**
 * Payload for updating an existing product
 * Contains fields that can be updated
 * ID cannot be changed, must be updated through API URL
 *
 * @extends CreateProductPayload
 */
export interface UpdateProductPayload extends CreateProductPayload {}

/**
 * Parameters for searching and filtering products
 * Used for API requests that fetch products
 *
 * @property search - Optional search term
 * @property size - Number of items per page
 * @property cursor - Pagination cursor
 *
 * @example
 * {
 *   search: "espresso",
 *   size: 10,
 *   cursor: 123
 * }
 */
export interface ProductSearchParams {
  search?: string;
  size?: number;
  cursor?: number;
}

/**
 * Response structure for paginated product list
 * Used for API responses that return multiple products
 *
 * @property data - Array of products with category information
 * @property paging - Pagination metadata
 * @property paging.total - Total number of items in current page
 * @property paging.hasMore - Indicates if more items exist
 * @property paging.cursor - Cursor for fetching next page
 *
 * @example
 * {
 *   data: [
 *     {
 *       id: 1,
 *       name: "Espresso",
 *       category: { id: 1, name: "Coffee" },
 *       // ... other properties
 *     }
 *   ],
 *   paging: {
 *     total: 1,
 *     hasMore: false,
 *     cursor: 123
 *   }
 * }
 */
export interface ProductListResponse {
  data: ProductWithCategory[];
  paging: {
    total: number;
    hasMore: boolean;
    cursor: number;
  };
}
