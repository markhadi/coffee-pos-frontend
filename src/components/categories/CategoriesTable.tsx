import { useMemo } from 'react';
import { CategoryResponse } from '@/types/category';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<CategoryResponse>();

/**
 * Custom metadata for table actions
 * @interface TableCustomMeta
 * @property {(category: CategoryResponse) => void} onEdit - Function to handle category edit
 * @property {(category: CategoryResponse) => void} onDelete - Function to handle category deletion
 */
interface TableCustomMeta {
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
}

/**
 * Props for CategoriesTable component
 * @interface CategoriesTableProps
 * @property {CategoryResponse[]} data - Array of category data to display
 * @property {(category: CategoryResponse) => void} onEdit - Function to handle category edit
 * @property {(category: CategoryResponse) => void} onDelete - Function to handle category deletion
 * @property {() => void} fetchNextPage - Function to fetch next page of data
 * @property {boolean} isFetching - Loading state indicator
 * @property {boolean} hasNextPage - Indicates if more data is available
 */
interface CategoriesTableProps {
  data: CategoryResponse[];
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
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
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    size: 150,
    cell: props => {
      const category = props.row.original;
      if (!category?.id) return null;

      return (
        <ActionButtons
          onEdit={meta.onEdit}
          onDelete={meta.onDelete}
          item={category}
        />
      );
    },
  }),
];

/**
 * Categories table component with virtualization and infinite scroll
 * Displays categories in a paginated table with edit and delete actions
 *
 * @component
 * @example
 * ```tsx
 * <CategoriesTable
 *   data={categories}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   fetchNextPage={fetchNextPage}
 *   isFetching={isFetching}
 *   hasNextPage={hasNextPage}
 * />
 * ```
 */
export function CategoriesTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: CategoriesTableProps) {
  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      height={300}
      entityName="categories"
      meta={{ onEdit, onDelete }}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
