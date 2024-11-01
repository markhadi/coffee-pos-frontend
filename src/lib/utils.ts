import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string to localized format
 * @param date - Date string to format
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-01-01T00:00:00Z') // returns 'January 1, 2024'
 */
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats a number as currency in USD format
 * @param amount - Number to format as currency
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(25000) // returns '$25,000.00'
 * formatCurrency(1000000) // returns '$1,000,000.00'
 */
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
