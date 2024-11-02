import { useVirtualizer } from '@tanstack/react-virtual';
import { createColumnHelper, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table';

interface UseVirtualTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  estimateSize?: number;
  overscan?: number;
  containerRef: React.RefObject<HTMLDivElement>;
  meta?: Record<string, any>;
}

/**
 * Custom hook to handle table virtualization with TanStack Table and Virtualizer
 * @template T - Type of the data being displayed
 * @param props - Hook configuration
 * @returns Object containing table instance and virtualization utilities
 *
 * @example
 * ```tsx
 * const { table, virtualRows, rowVirtualizer } = useVirtualTable({
 *   data,
 *   columns,
 *   containerRef: tableContainerRef,
 *   meta: { onEdit, onDelete }
 * });
 * ```
 */
export function useVirtualTable<T>({ data, columns, estimateSize = 48, overscan = 5, containerRef, meta }: UseVirtualTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta,
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return {
    table,
    rows,
    virtualRows,
    rowVirtualizer,
  };
}

// Export column helper for convenience
export { createColumnHelper };
