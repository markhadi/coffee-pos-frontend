import { useVirtualTable, createColumnHelper } from '@/hooks/useVirtualTable';
import { useMemo } from 'react';
import { PaymentMethod } from '@/types/payment-method';
import { formatDate } from '@/lib/utils';
import { ActionButtons } from '@/components/ui/action-button';
import { useTableScroll } from '@/hooks/useTableScroll';
import { flexRender } from '@tanstack/react-table';
import { TableEmptyState } from '@/components/ui/table-empty-state';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<PaymentMethod>();

/**
 * Custom metadata for table actions
 */
interface TableCustomMeta {
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (paymentMethod: PaymentMethod) => void;
}

/**
 * Props for PaymentMethodTable component
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
 * Creates table columns configuration
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
 */
export function PaymentMethodTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: PaymentMethodTableProps) {
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
      <TableEmptyState
        isFetching={isFetching}
        entityName="payment methods"
      />
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
