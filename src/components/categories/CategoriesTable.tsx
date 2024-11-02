import { useVirtualizer } from '@tanstack/react-virtual';
import { createColumnHelper, getCoreRowModel, useReactTable, flexRender } from '@tanstack/react-table';
import { useRef, useMemo, useCallback, useEffect } from 'react';
import { CategoryResponse } from '@/types/category';
import { ActionButtons } from '@/components/ui/action-button';
import { useTableScroll } from '@/hooks/useTableScroll';

const columnHelper = createColumnHelper<CategoryResponse>();

interface TableCustomMeta {
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
}

interface CategoriesTableProps {
  data: CategoryResponse[];
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
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

export function CategoriesTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: CategoriesTableProps) {
  const { tableContainerRef, handleScroll } = useTableScroll({
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onEdit, onDelete } as TableCustomMeta,
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
      <div className="h-[300px] flex items-center justify-center border border-slate-200 rounded-lg">
        <div className="text-center text-slate-500">{isFetching ? 'Loading categories...' : 'No categories found'}</div>
      </div>
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className="h-[300px] overflow-auto relative rounded-lg border border-slate-200 shadow-md"
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
