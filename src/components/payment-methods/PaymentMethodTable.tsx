import { useMemo } from 'react';
import { PaymentMethod } from '@/types/payment-method';
import { formatDate } from '@/lib/utils';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<PaymentMethod>();

/**
 * Custom metadata for table actions
 * @interface TableCustomMeta
 * @property {(paymentMethod: PaymentMethod) => void} onEdit - Function to handle payment method edit
 * @property {(paymentMethod: PaymentMethod) => void} onDelete - Function to handle payment method deletion
 */
interface TableCustomMeta {
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (paymentMethod: PaymentMethod) => void;
}

/**
 * Props for PaymentMethodTable component
 * @interface PaymentMethodTableProps
 * @property {PaymentMethod[]} data - Array of payment method data to display
 * @property {(paymentMethod: PaymentMethod) => void} onEdit - Function to handle payment method edit
 * @property {(paymentMethod: PaymentMethod) => void} onDelete - Function to handle payment method deletion
 * @property {() => void} fetchNextPage - Function to fetch next page of data
 * @property {boolean} isFetching - Loading state indicator
 * @property {boolean} hasNextPage - Indicates if more data is available
 */
interface PaymentMethodTableProps {
  data: PaymentMethod[];
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (paymentMethod: PaymentMethod) => void;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
}

/**
 * Creates table columns configuration with actions
 * @param {TableCustomMeta} meta - Object containing edit and delete handlers
 * @returns {Array} Array of column definitions
 */
const createTableColumns = (meta: TableCustomMeta) => [
  columnHelper.display({
    id: 'index',
    header: 'No',
    size: 70,
    cell: props => props.row.index + 1,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('description', {
    header: 'Description',
    size: 250,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('is_active', {
    header: 'Status',
    size: 100,
    cell: info => <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{info.getValue() ? 'Active' : 'Inactive'}</span>,
  }),
  columnHelper.accessor('created_at', {
    header: 'Created At',
    size: 200,
    cell: info => formatDate(info.getValue()),
  }),
  columnHelper.accessor('updated_at', {
    header: 'Updated At',
    size: 200,
    cell: info => formatDate(info.getValue()),
  }),
  columnHelper.accessor('created_by_username', {
    header: 'Created By',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('updated_by_username', {
    header: 'Updated By',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    size: 150,
    cell: props => {
      const paymentMethod = props.row.original;
      if (!paymentMethod?.id) return null;

      return (
        <ActionButtons
          onEdit={meta.onEdit}
          onDelete={meta.onDelete}
          item={paymentMethod}
        />
      );
    },
  }),
];

/**
 * Payment method table component with virtualization and infinite scroll
 * Displays payment methods in a paginated table with edit and delete actions
 *
 * @component
 * @example
 * ```tsx
 * <PaymentMethodTable
 *   data={paymentMethods}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   fetchNextPage={fetchNextPage}
 *   isFetching={isFetching}
 *   hasNextPage={hasNextPage}
 * />
 * ```
 */
export function PaymentMethodTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: PaymentMethodTableProps) {
  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      entityName="payment methods"
      meta={{ onEdit, onDelete }}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
