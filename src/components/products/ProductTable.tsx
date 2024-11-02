import { useMemo } from 'react';
import { ProductWithCategory } from '@/types/product';
import { formatDate, formatCurrency } from '@/lib/utils';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<ProductWithCategory>();

/**
 * Custom metadata for table actions
 * @interface TableCustomMeta
 * @property {(product: ProductWithCategory) => void} onEdit - Function to handle product edit
 * @property {(product: ProductWithCategory) => void} onDelete - Function to handle product deletion
 */
interface TableCustomMeta {
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
}

/**
 * Props for ProductTable component
 * @interface ProductTableProps
 * @property {ProductWithCategory[]} data - Array of product data to display
 * @property {(product: ProductWithCategory) => void} onEdit - Function to handle product edit
 * @property {(product: ProductWithCategory) => void} onDelete - Function to handle product deletion
 * @property {() => void} fetchNextPage - Function to fetch next page of data
 * @property {boolean} isFetching - Loading state indicator
 * @property {boolean} hasNextPage - Indicates if more data is available
 */
interface ProductTableProps {
  data: ProductWithCategory[];
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
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
  columnHelper.accessor('code', {
    header: 'Code',
    size: 120,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('category.name', {
    header: 'Category',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('stock', {
    header: 'Stock',
    size: 100,
    cell: info => info.getValue()?.toLocaleString() ?? '0',
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    size: 120,
    cell: info => formatCurrency(info.getValue() ?? 0),
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
      const product = props.row.original;
      if (!product?.id) return null;

      return (
        <ActionButtons
          onEdit={meta.onEdit}
          onDelete={meta.onDelete}
          item={product}
        />
      );
    },
  }),
];

/**
 * Product table component with virtualization and infinite scroll
 * Displays products in a paginated table with edit and delete actions
 *
 * @component
 * @example
 * ```tsx
 * <ProductTable
 *   data={products}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   fetchNextPage={fetchNextPage}
 *   isFetching={isFetching}
 *   hasNextPage={hasNextPage}
 * />
 * ```
 */
export function ProductTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: ProductTableProps) {
  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      entityName="products"
      meta={{ onEdit, onDelete }}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
