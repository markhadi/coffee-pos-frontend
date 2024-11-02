import { flexRender } from '@tanstack/react-table';
import { type ColumnDef } from '@tanstack/react-table';
import { useVirtualTable } from '@/hooks/useVirtualTable';
import { useTableScroll } from '@/hooks/useTableScroll';
import { TableEmptyState } from './table-empty-state';

interface VirtualTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  height?: number;
  entityName: string;
  meta?: Record<string, any>;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
}

/**
 * Reusable virtualized table component with infinite scroll
 * @template T - Type of the data being displayed
 */
export function VirtualTable<T>({ data, columns, height = 550, entityName, meta, fetchNextPage, isFetching, hasNextPage }: VirtualTableProps<T>) {
  const { tableContainerRef, handleScroll } = useTableScroll({
    fetchNextPage,
    isFetching,
    hasNextPage,
  });

  const { table, virtualRows, rowVirtualizer } = useVirtualTable({
    data,
    columns,
    containerRef: tableContainerRef,
    meta,
  });

  if (!data.length) {
    return (
      <TableEmptyState
        height={height}
        isFetching={isFetching}
        entityName={entityName}
      />
    );
  }

  return (
    <div
      ref={tableContainerRef}
      className={`h-[${height}px] overflow-auto relative rounded-lg border border-slate-200 shadow-md`}
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
