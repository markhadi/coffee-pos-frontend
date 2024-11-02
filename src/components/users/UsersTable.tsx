import { useVirtualTable, createColumnHelper } from '@/hooks/useVirtualTable';
import { useMemo } from 'react';
import { UserResponse } from '@/types/user';
import { formatDate } from '@/lib/utils';
import { ActionButtons } from '@/components/ui/action-button';
import { useTableScroll } from '@/hooks/useTableScroll';
import { flexRender } from '@tanstack/react-table';

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
  const { tableContainerRef, handleScroll } = useTableScroll({
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  const { table, virtualRows, rowVirtualizer } = useVirtualTable({
    data,
    columns,
    containerRef: tableContainerRef,
    meta: { onEdit, onDelete } as TableCustomMeta,
  });

  // Show empty state if no data
  if (!data.length) {
    return (
      <div className="h-[550px] flex items-center justify-center border border-slate-200 rounded-lg">
        <div className="text-center text-slate-500">{isFetching ? 'Loading users...' : 'No users found'}</div>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="h-[550px] overflow-auto relative rounded-lg border border-slate-200 shadow-md"
      onScroll={e => handleScroll(e.target as HTMLDivElement)}
    >
      <table className="w-full border-collapse bg-white text-left text-slate-700">
        <thead className="bg-slate-100 z-10 sticky top-0 shadow-sm w-full">
          {table.getHeaderGroups().map(headerGroup => (
            <tr
              key={headerGroup.id}
              className="grid grid-flow-col w-full"
            >
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-4 py-4 font-semibold text-neutral-900 whitespace-nowrap"
                  style={{ width: header.getSize() }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          className="divide-y divide-slate-200 border-t border-slate-200 w-full relative"
          style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
        >
          {virtualRows.map(virtualRow => {
            const row = table.getRowModel().rows[virtualRow.index];
            return (
              <tr
                key={row.id}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="hover:bg-slate-50 absolute w-full grid grid-flow-col transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className="px-4 py-2 flex items-center whitespace-nowrap overflow-hidden"
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {isFetching && <div className="text-center py-4 text-slate-600 bg-slate-50 border-t border-slate-200">Loading more...</div>}
    </div>
  );
}
