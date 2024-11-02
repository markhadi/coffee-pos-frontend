import { useMemo } from 'react';
import { UserResponse } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

const columnHelper = createColumnHelper<UserResponse>();

interface TableCustomMeta {
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

interface UsersTableProps {
  data: UserResponse[];
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
}

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

export function UsersTable({ data, onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: UsersTableProps) {
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
