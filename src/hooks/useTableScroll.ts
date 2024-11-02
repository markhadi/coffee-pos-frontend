import { useRef, useCallback, useEffect } from 'react';

interface UseTableScrollProps {
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
  threshold?: number;
}

/**
 * Custom hook to handle infinite scroll functionality for tables
 * @param props - Hook configuration
 * @returns Object containing ref and scroll handler
 *
 * @example
 * ```tsx
 * const { tableContainerRef, handleScroll } = useTableScroll({
 *   fetchNextPage,
 *   isFetching,
 *   hasNextPage,
 * });
 * ```
 */
export function useTableScroll({ fetchNextPage, isFetching, hasNextPage, threshold = 500 }: UseTableScrollProps) {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (!containerRefElement) return;

      const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < threshold;

      if (isNearBottom && !isFetching && hasNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, isFetching, hasNextPage, threshold]
  );

  useEffect(() => {
    handleScroll(tableContainerRef.current);
  }, [handleScroll]);

  return {
    tableContainerRef,
    handleScroll,
  };
}
