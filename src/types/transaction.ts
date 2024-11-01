/**
 * Represents a transaction item in the system
 * Contains details about product and quantity in a transaction
 *
 * @property id - Unique identifier for transaction item
 * @property transaction_id - Reference to parent transaction
 * @property product_id - Reference to product
 * @property quantity - Number of items purchased
 * @property amount - Total amount for this item
 * @property product_name - Name of the product
 * @property product_price - Price per unit
 * @property product_category_id - Product category reference
 * @property product_category_name - Name of product category
 */
export interface TransactionItem {
  id: number;
  transaction_id: string;
  product_id: number;
  quantity: number;
  amount: number;
  product_name: string;
  product_price: number;
  product_category_id: number;
  product_category_name: string;
}

/**
 * Represents a complete transaction
 * Contains transaction details and associated items
 *
 * @property transaction_id - Unique identifier
 * @property customer_name - Name of customer
 * @property total_quantity - Total items in transaction
 * @property total_amount - Total transaction amount
 * @property payment_method_id - Reference to payment method
 * @property payment_method - Name of payment method
 * @property service_by - Staff who handled transaction
 * @property username - Username of staff
 * @property service_charge - Service charge percentage (0-1)
 * @property issued_at - Transaction timestamp
 * @property transaction_items - Array of items in transaction
 *
 * @example
 * {
 *   transaction_id: "TRX001",
 *   customer_name: "John Doe",
 *   total_amount: 50000,
 *   payment_method: "Cash",
 *   service_charge: 0.1,
 *   transaction_items: [...]
 * }
 */
export interface Transaction {
  transaction_id: string;
  customer_name: string;
  total_quantity: number;
  total_amount: number;
  payment_method_id: number;
  payment_method: string;
  service_by: string;
  username: string;
  service_charge: number;
  issued_at: string;
  transaction_items: TransactionItem[];
}

/**
 * Payload for creating a new transaction
 * Contains required fields for transaction creation
 *
 * @property customer_name - Name of customer (max 10 chars)
 * @property total_quantity - Total items in transaction
 * @property total_amount - Total transaction amount
 * @property payment_method_id - Selected payment method
 * @property service_charge - Service charge percentage (0-1)
 * @property transaction_items - Items to be purchased
 *
 * @example
 * {
 *   customer_name: "John",
 *   total_amount: 50000,
 *   payment_method_id: 1,
 *   service_charge: 0.1,
 *   transaction_items: [
 *     { product_id: 1, quantity: 2, amount: 50000 }
 *   ]
 * }
 */
export interface CreateTransactionPayload {
  customer_name: string;
  total_quantity: number;
  total_amount: number;
  payment_method_id: number;
  service_charge: number;
  transaction_items: CreateTransactionItemPayload[];
}

/**
 * Payload for creating a transaction item
 * Part of CreateTransactionPayload
 *
 * @property product_id - Product being purchased
 * @property quantity - Number of items
 * @property amount - Total amount for this item
 */
export interface CreateTransactionItemPayload {
  product_id: number;
  quantity: number;
  amount: number;
}

/**
 * Response structure for transaction list
 * Used for API responses that return multiple transactions
 *
 * @property data - Array of transaction summaries
 * @property paging - Pagination metadata
 */
export interface TransactionListResponse {
  data: TransactionListItem[];
  paging: {
    total: number;
    hasMore: boolean;
  };
}

/**
 * Summary information for transaction list
 * Used in list views and reports
 */
export interface TransactionListItem {
  transaction_id: string;
  customer_name: string;
  total_quantity: number;
  total_amount: number;
  payment_method_id: number;
  payment_method: string;
  service_by: string;
  username: string;
  service_charge: number;
  issued_at: string;
}

/**
 * Parameters for fetching transaction list
 * Used for pagination
 */
export interface TransactionListParams {
  size: number;
  cursor?: string;
}

/**
 * Sales data for a specific date
 * Used in reports and dashboards
 */
export interface DailySales {
  date: string;
  totalSale: number;
}

/**
 * Detailed sales data for date range
 * Used in reports and dashboards
 */
export interface SalesByDateRangeItem {
  date: string;
  numberOfTransactions: number;
  totalSales: number;
}

/**
 * Parameters for fetching sales by date range
 */
export interface SalesByDateRangeParams {
  from: string;
  to: string;
}

/**
 * Response types for various sales metrics
 */
export interface TodaySalesResponse {
  data: number;
}

export interface TodayTransactionCountResponse {
  data: number;
}

export interface AverageTransactionResponse {
  data: number;
}

export interface Last7DaysSalesResponse {
  data: DailySales[];
}

export interface SalesByDateRangeResponse {
  data: SalesByDateRangeItem[];
}
