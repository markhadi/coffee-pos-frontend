/**
 * Represents a user in the system
 * Contains basic user information and metadata
 *
 * @property username - Unique identifier for the user
 * @property name - Display name of the user
 * @property role - User's role (ADMIN or CASHIER)
 * @property created_at - Timestamp of user creation
 * @property updated_at - Timestamp of last update
 */
export interface UserResponse {
  username: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
  created_at: string;
  updated_at: string;
}

/**
 * Response structure for paginated user list
 * Contains array of users and pagination metadata
 *
 * @property data - Array of user objects
 * @property paging - Pagination information
 * @property paging.total - Total number of items in current page
 * @property paging.hasMore - Indicates if more items exist
 * @property paging.cursor - Cursor for fetching next page
 *
 * @example
 * {
 *   data: [{ username: "john_doe", ... }],
 *   paging: {
 *     total: 10,
 *     hasMore: true,
 *     cursor: "next_page_token"
 *   }
 * }
 */
export interface UserListResponse {
  data: UserResponse[];
  paging: {
    total: number;
    hasMore: boolean;
    cursor: number;
  };
}

/**
 * Payload for creating a new user
 * Contains required fields for user creation
 *
 * @property username - Unique username for new user
 * @property password - User's password (must meet security requirements)
 * @property name - Display name for the user
 * @property role - User's role in the system
 *
 * @example
 * {
 *   username: "john_doe",
 *   password: "SecurePass123",
 *   name: "John Doe",
 *   role: "CASHIER"
 * }
 */
export interface CreateUserPayload {
  username: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'CASHIER';
}

/**
 * Payload for updating an existing user
 * Password is optional for updates
 * Username cannot be changed, must be updated through API URL
 *
 * @property name - Updated display name
 * @property role - Updated user role
 * @property password - Optional new password
 *
 * @example
 * {
 *   name: "John Updated",
 *   role: "ADMIN",
 *   password: "NewPass123" // optional
 * }
 */
export interface UpdateUserPayload {
  name: string;
  role: 'ADMIN' | 'CASHIER';
  password?: string;
}
