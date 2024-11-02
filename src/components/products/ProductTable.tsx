import { flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';
import { ProductWithCategory } from '@/types/product';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ActionButtons } from '@/components/ui/action-button';
import { useTableScroll } from '@/hooks/useTableScroll';
import { useVirtualTable, createColumnHelper } from '@/hooks/useVirtualTable';
import { TableEmptyState } from '@/components/ui/table-empty-state';

/**
 * Column helper for type-safe table column definitions
 */
const columnHelper = createColumnHelper<ProductWithCategory>();

/**
 * Custom metadata for table actions
 */
interface TableCustomMeta {
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
}

/**
 * Props for ProductTable component
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
 * Creates table columns configuration
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
 */
export function ProductTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: ProductTableProps) {
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
        entityName="products"
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
