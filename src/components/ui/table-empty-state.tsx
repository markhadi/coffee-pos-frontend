interface TableEmptyStateProps {
  height?: number;
  isFetching: boolean;
  entityName: string;
}

/**
 * Component to display empty state or loading state for tables
 * @component
 * @example
 * ```tsx
 * <TableEmptyState
 *   height={550}
 *   isFetching={isFetching}
 *   entityName="products"
 * />
 * ```
 */
export function TableEmptyState({ height = 550, isFetching, entityName }: TableEmptyStateProps) {
  return (
    <div
      style={{ height: `${height}px` }}
      className="flex items-center justify-center border border-slate-200 rounded-lg"
    >
      <div className="text-center text-slate-500">{isFetching ? `Loading ${entityName}...` : `No ${entityName} found`}</div>
    </div>
  );
}
