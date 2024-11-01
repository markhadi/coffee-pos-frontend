import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaymentMethods } from '@/hooks/usePaymentMethod';
import { UseFormReturn } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

/**
 * Props for PaymentMethodSelect component
 */
interface PaymentMethodSelectProps {
  field: {
    onChange: (value: string) => void;
    value: string;
  };
  form: UseFormReturn<any>;
}

/**
 * Payment method select component
 * Displays a dropdown of active payment methods
 * Handles loading and error states
 */
export function PaymentMethodSelect({ field, form }: PaymentMethodSelectProps) {
  // Get payment methods from API
  const { query: paymentMethodsQuery } = usePaymentMethods('');
  const paymentMethods = paymentMethodsQuery.data?.pages.flatMap(page => page.data) ?? [];

  // Show loading state
  if (paymentMethodsQuery.isLoading) {
    return (
      <FormItem className="flex flex-col">
        <FormLabel>Payment Method</FormLabel>
        <div className="flex items-center gap-2 h-10 px-3 py-2 rounded-md border border-slate-200">
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
          <span className="text-slate-500">Loading payment methods...</span>
        </div>
      </FormItem>
    );
  }

  // Show error state
  if (paymentMethodsQuery.isError) {
    return (
      <FormItem className="flex flex-col">
        <FormLabel>Payment Method</FormLabel>
        <div className="text-sm text-red-500 h-10 px-3 py-2 rounded-md border border-red-200 bg-red-50">Error loading payment methods</div>
      </FormItem>
    );
  }

  // Filter active payment methods
  const activePaymentMethods = paymentMethods.filter(method => method.is_active);

  // Show empty state if no active payment methods
  if (!activePaymentMethods.length) {
    return (
      <FormItem className="flex flex-col">
        <FormLabel>Payment Method</FormLabel>
        <div className="text-sm text-slate-500 h-10 px-3 py-2 rounded-md border border-slate-200">No active payment methods available</div>
      </FormItem>
    );
  }

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Payment Method</FormLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {activePaymentMethods.map(method => (
            <SelectItem
              key={method.id}
              value={method.id.toString()}
            >
              <div className="flex flex-col">
                <span className="font-medium">{method.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
}
