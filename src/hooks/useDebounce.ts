import { useEffect, useState } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating a value until a specified time has passed since the last change
 * Useful for preventing excessive API calls or expensive operations
 *
 * @param value - Value to debounce
 * @param delay - Delay in milliseconds before value updates
 * @returns Debounced value
 *
 * @example
 * // Debounce search input with 300ms delay
 * const [search, setSearch] = useState('')
 * const debouncedSearch = useDebounce(search, 300)
 *
 * // Use debouncedSearch for API calls
 * useEffect(() => {
 *   fetchData(debouncedSearch)
 * }, [debouncedSearch])
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up timer to update debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up timer on value change or unmount
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
