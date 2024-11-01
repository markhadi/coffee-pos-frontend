import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { PaymentMethod } from '@/types/payment-method';

/**
 * Default values for create mode
 */
const DEFAULT_CREATE_VALUES = {
  name: '',
  description: '',
  is_active: true,
};

/**
 * Validation schema for payment method form
 */
const paymentMethodSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
  description: z.string(),
  is_active: z.boolean(),
});

/**
 * Type definition for form data
 */
type FormData = z.infer<typeof paymentMethodSchema>;

/**
 * Props for PaymentMethodFormDialog component
 */
interface PaymentMethodFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  paymentMethod?: PaymentMethod;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

/**
 * Dialog component for creating and editing payment methods
 * Provides form validation and unsaved changes warning
 */
export default function PaymentMethodFormDialog({ open, onClose, onSubmit, paymentMethod, mode, isLoading = false }: PaymentMethodFormDialogProps) {
  /**
   * Initialize form with validation schema and default values
   */
  const form = useForm<FormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues:
      mode === 'create'
        ? DEFAULT_CREATE_VALUES
        : {
            name: paymentMethod?.name,
            description: paymentMethod?.description || '',
            is_active: paymentMethod?.is_active ?? true,
          },
  });

  /**
   * Reset form when mode or payment method changes
   */
  useEffect(() => {
    const values =
      mode === 'create'
        ? DEFAULT_CREATE_VALUES
        : paymentMethod
        ? {
            name: paymentMethod.name,
            description: paymentMethod.description || '',
            is_active: paymentMethod.is_active,
          }
        : DEFAULT_CREATE_VALUES;

    form.reset(values);
  }, [paymentMethod, mode, form]);

  /**
   * Handle form submission
   * Transforms empty description to dash
   */
  const handleSubmit = (data: FormData) => {
    const transformedData = {
      ...data,
      description: data.description.trim() || '-',
    };
    onSubmit(transformedData);
    form.reset();
    onClose();
  };

  const isDirty = form.formState.isDirty;

  /**
   * Handle dialog close with unsaved changes warning
   */
  const handleClose = useCallback(() => {
    if (isDirty && window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      form.reset();
      onClose();
    } else if (!isDirty) {
      onClose();
    }
  }, [isDirty, form, onClose]);

  // Show warning when leaving page with unsaved changes
  useBeforeUnload(isDirty);

  /**
   * Render form fields
   */
  const renderFormFields = () => (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Enter payment method description (optional)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active Status</FormLabel>
              <div className="text-sm text-muted-foreground">Set whether this payment method is active or inactive</div>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );

  /**
   * Render form action buttons
   */
  const renderFormActions = () => (
    <div className="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'create' ? 'Creating...' : 'Updating...'}
          </>
        ) : mode === 'create' ? (
          'Create'
        ) : (
          'Update'
        )}
      </Button>
    </div>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add Payment Method' : 'Edit Payment Method'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {renderFormFields()}
            {renderFormActions()}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
