import { useMemo } from 'react';
import { UserResponse } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<UserResponse>();

/**
 * Custom metadata for table actions
 * @interface TableCustomMeta
 * @property {(user: UserResponse) => void} onEdit - Function to handle user edit
 * @property {(user: UserResponse) => void} onDelete - Function to handle user deletion
 */
interface TableCustomMeta {
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

/**
 * Props for UsersTable component
 * @interface UsersTableProps
 * @property {UserResponse[]} data - Array of user data to display
 * @property {(user: UserResponse) => void} onEdit - Function to handle user edit
 * @property {(user: UserResponse) => void} onDelete - Function to handle user deletion
 * @property {() => void} fetchNextPage - Function to fetch next page of data
 * @property {boolean} isFetching - Loading state indicator
 * @property {boolean} hasNextPage - Indicates if more data is available
 */
interface UsersTableProps {
  data: UserResponse[];
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
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
  columnHelper.accessor('username', {
    header: 'Username',
    size: 150,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    size: 100,
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
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    size: 150,
    cell: props => (
      <ActionButtons
        onEdit={meta.onEdit}
        onDelete={meta.onDelete}
        item={props.row.original}
      />
    ),
  }),
];

/**
 * Users table component with virtualization and infinite scroll
 * Displays users in a paginated table with edit and delete actions
 *
 * @component
 * @example
 * ```tsx
 * <UsersTable
 *   data={users}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   fetchNextPage={fetchNextPage}
 *   isFetching={isFetching}
 *   hasNextPage={hasNextPage}
 * />
 * ```
 */
export function UsersTable({ data, onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: UsersTableProps) {
  // Memoize columns to prevent unnecessary re-renders
  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      entityName="users"
      meta={{ onEdit, onDelete }}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
