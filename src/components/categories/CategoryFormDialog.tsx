import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { CategoryResponse } from '@/types/category';

/**
 * Default values for create mode
 */
const DEFAULT_CREATE_VALUES = { name: '' };

/**
 * Validation schema for creating a category
 */
const createCategorySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
});

/**
 * Validation schema for updating a category
 */
const updateCategorySchema = createCategorySchema;

/**
 * Type definitions for form data
 */
type CreateFormData = z.infer<typeof createCategorySchema>;
type UpdateFormData = z.infer<typeof updateCategorySchema>;

/**
 * Props for CategoryFormDialog component
 */
interface CategoryFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFormData | UpdateFormData) => void;
  category?: CategoryResponse;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

/**
 * Dialog component for creating and editing categories
 * Provides form validation and unsaved changes warning
 */
export default function CategoryFormDialog({ open, onClose, onSubmit, category, mode, isLoading }: CategoryFormDialogProps) {
  /**
   * Initialize form with validation schema and default values
   */
  const form = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(mode === 'create' ? createCategorySchema : updateCategorySchema),
    defaultValues: mode === 'create' ? DEFAULT_CREATE_VALUES : { name: category?.name },
  });

  /**
   * Reset form when mode or category changes
   */
  useEffect(() => {
    const values = mode === 'create' ? DEFAULT_CREATE_VALUES : category ? { name: category.name } : { name: '' };

    form.reset(values);
  }, [category, mode, form]);

  /**
   * Handle form submission
   */
  const handleSubmit = (data: CreateFormData | UpdateFormData) => {
    onSubmit(data);
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
          <DialogTitle>{mode === 'create' ? 'Create Category' : 'Edit Category'}</DialogTitle>
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
