/**
 * Represents a payment method in the system
 * Contains payment method information and metadata
 *
 * @property id - Unique numeric identifier
 * @property name - Display name of the payment method
 * @property description - Optional description
 * @property is_active - Whether the payment method is active
 * @property created_at - Timestamp of creation
 * @property updated_at - Timestamp of last update
 * @property created_by_username - Username who created the payment method
 * @property updated_by_username - Username who last updated the payment method
 *
 * @example
 * {
 *   id: 1,
 *   name: "Cash",
 *   description: "Cash payment",
 *   is_active: true,
 *   created_at: "2024-01-01T00:00:00Z",
 *   updated_at: "2024-01-01T00:00:00Z",
 *   created_by_username: "admin",
 *   updated_by_username: "admin"
 * }
 */
export interface PaymentMethod {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by_username: string;
  updated_by_username: string;
}

/**
 * Payload for creating a new payment method
 * Contains required fields for payment method creation
 *
 * @property name - Name of the payment method
 * @property description - Optional description
 * @property is_active - Whether the payment method should be active
 *
 * @example
 * {
 *   name: "Credit Card",
 *   description: "Visa/Mastercard payment",
 *   is_active: true
 * }
 */
export interface CreatePaymentMethodPayload {
  name: string;
  description?: string;
  is_active: boolean;
}

/**
 * Payload for updating an existing payment method
 * Contains fields that can be updated
 * ID cannot be changed, must be updated through API URL
 *
 * @property name - Updated name
 * @property description - Updated description
 * @property is_active - Updated active status
 *
 * @example
 * {
 *   name: "Updated Credit Card",
 *   description: "Updated description",
 *   is_active: false
 * }
 */
export interface UpdatePaymentMethodPayload {
  name: string;
  description?: string;
  is_active: boolean;
}

/**
 * Response structure for paginated payment method list
 * Used for API responses that return multiple payment methods
 *
 * @property data - Array of payment method objects
 * @property paging - Pagination metadata
 * @property paging.total - Total number of items in current page
 * @property paging.hasMore - Indicates if more items exist
 * @property paging.cursor - Cursor for fetching next page
 *
 * @example
 * {
 *   data: [
 *     { id: 1, name: "Cash", ... },
 *     { id: 2, name: "Credit Card", ... }
 *   ],
 *   paging: {
 *     total: 2,
 *     hasMore: true,
 *     cursor: 123
 *   }
 * }
 */
export interface PaymentMethodListResponse {
  data: PaymentMethod[];
  paging: {
    total: number;
    hasMore: boolean;
    cursor: number;
  };
}

/**
 * Parameters for searching and filtering payment methods
 * Used for API requests that fetch payment methods
 *
 * @property search - Optional search term
 * @property size - Number of items per page
 * @property cursor - Pagination cursor
 *
 * @example
 * {
 *   search: "card",
 *   size: 10,
 *   cursor: 123
 * }
 */
export interface PaymentMethodSearchParams {
  search?: string;
  size?: number;
  cursor?: number;
}
