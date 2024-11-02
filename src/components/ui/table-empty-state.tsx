interface TableEmptyStateProps {
  height: number;
  entityName: string;
  isFetching?: boolean;
}

/**
 * Component to display empty state or loading state for tables
 * @component
 * @example
 * ```tsx
 * <TableEmptyState
 *   height={550}
 *   entityName="products"
 *   isFetching={isFetching}
 * />
 * ```
 */
export function TableEmptyState({ height, entityName, isFetching = false }: TableEmptyStateProps) {
  return (
    <div
      style={{ height: `${height}px` }}
      className="flex items-center justify-center border border-slate-200 rounded-lg"
    >
      <div className="text-center text-slate-500">{isFetching ? `Loading ${entityName}...` : `No ${entityName} found`}</div>
    </div>
  );
}
