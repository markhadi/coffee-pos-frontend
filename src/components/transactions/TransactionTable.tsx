import { useMemo } from 'react';
import { TransactionListItem } from '@/types/transaction';
import { formatDate, formatCurrency } from '@/lib/utils';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<TransactionListItem>();

/**
 * Props for TransactionTable component
 * @interface TransactionTableProps
 * @property {TransactionListItem[]} data - Array of transaction data to display
 * @property {() => void} fetchNextPage - Function to fetch next page of data
 * @property {boolean} isFetching - Loading state indicator
 * @property {boolean} hasNextPage - Indicates if more data is available
 */
interface TransactionTableProps {
  data: TransactionListItem[];
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
}

/**
 * Creates table columns configuration
 * @returns {Array} Array of column definitions
 */
const createTableColumns = () => [
  columnHelper.display({
    id: 'index',
    header: 'No',
    size: 70,
    cell: props => props.row.index + 1,
  }),
  columnHelper.accessor('transaction_id', {
    header: 'Transaction ID',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('customer_name', {
    header: 'Customer',
    size: 200,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('service_by', {
    header: 'Service By',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('payment_method', {
    header: 'Payment Method',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('total_quantity', {
    header: 'Quantity',
    size: 100,
    cell: info => info.getValue()?.toLocaleString() ?? '0',
  }),
  columnHelper.accessor('total_amount', {
    header: 'Total',
    size: 120,
    cell: info => formatCurrency(info.getValue() ?? 0),
  }),
  columnHelper.accessor('service_charge', {
    header: 'Service Charge',
    size: 120,
    cell: info => `${((info.getValue() ?? 0) * 100).toFixed(0)}%`,
  }),
  columnHelper.accessor('issued_at', {
    header: 'Date',
    size: 200,
    cell: info => formatDate(info.getValue()),
  }),
];

/**
 * Transaction table component with virtualization and infinite scroll
 * Displays transactions in a paginated table
 *
 * @component
 * @example
 * ```tsx
 * <TransactionTable
 *   data={transactions}
 *   fetchNextPage={fetchNextPage}
 *   isFetching={isFetching}
 *   hasNextPage={hasNextPage}
 * />
 * ```
 */
export function TransactionTable({ data = [], fetchNextPage, isFetching, hasNextPage }: TransactionTableProps) {
  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => createTableColumns(), []);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      entityName="transactions"
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
