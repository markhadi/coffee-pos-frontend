import { useVirtualizer } from '@tanstack/react-virtual';
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender } from '@tanstack/react-table';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import { TransactionListItem } from '@/types/transaction';
import { formatDate, formatCurrency } from '@/lib/utils';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<TransactionListItem>();

/**
 * Props for TransactionTable component
 */
interface TransactionTableProps {
  data: TransactionListItem[];
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
}

/**
 * Creates table columns configuration
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
 */
export function TransactionTable({ data = [], fetchNextPage, isFetching, hasNextPage }: TransactionTableProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (!containerRefElement) return;

      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 500;

      if (isNearBottom && !isFetching && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, isFetching, hasNextPage]
  );

  useEffect(() => {
    handleScroll(tableContainerRef.current);
  }, [handleScroll]);

  const columns = useMemo(() => createTableColumns(), []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  // Show empty state if no data
  if (!data.length) {
    return (
      <div className="h-[550px] flex items-center justify-center border border-slate-200 rounded-lg">
        <div className="text-center text-slate-500">{isFetching ? 'Loading transactions...' : 'No transactions found'}</div>
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
            const row = rows[virtualRow.index];
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
