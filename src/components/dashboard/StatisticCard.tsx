import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

/**
 * Props for StatisticCard component
 */
interface StatisticCardProps {
  label: string;
  value: string | number;
  isLoading?: boolean;
  error?: boolean;
  isCurrency?: boolean; // Add flag to determine if value should be formatted as currency
}

/**
 * Card component for displaying statistics
 * Shows loading and error states
 */
export function StatisticCard({ label, value, isLoading, error, isCurrency = true }: StatisticCardProps) {
  return (
    <div className="w-full flex flex-col p-4 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-xl text-neutral-50">
      <span className="text-[16px] font-normal">{label}</span>
      {isLoading ? (
        <div className="flex items-center justify-center h-[48px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <span className="text-[32px] font-bold">Error</span>
      ) : (
        <span className="text-[32px] font-bold">{typeof value === 'number' && isCurrency ? formatCurrency(value) : value}</span>
      )}
    </div>
  );
}
