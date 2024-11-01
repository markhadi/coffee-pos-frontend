import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';
import { ProductWithCategory, Category, CreateProductPayload, UpdateProductPayload } from '@/types/product';

/**
 * Default values for create mode
 */
const DEFAULT_CREATE_VALUES = {
  code: '',
  name: '',
  stock: 0,
  price: 0,
  category_id: '',
};

/**
 * Validation schema for product form
 */
const productSchema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .max(10, 'Code must be less than 10 characters')
    .regex(/^[A-Z][0-9]{3}$/, 'Code must be in format: X000 (1 capital letter followed by 3 numbers)'),
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name must be less than 100 characters'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  category_id: z.string().min(1, 'Category is required'),
});

/**
 * Type definition for form data
 */
type FormData = z.infer<typeof productSchema>;

/**
 * Props for ProductFormDialog component
 */
interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductPayload | UpdateProductPayload) => void;
  product?: ProductWithCategory;
  mode: 'create' | 'edit';
  isLoading?: boolean;
  categories: Category[];
}

/**
 * Dialog component for creating and editing products
 * Provides form validation and unsaved changes warning
 */
export default function ProductFormDialog({ open, onClose, onSubmit, product, mode, isLoading = false, categories }: ProductFormDialogProps) {
  /**
   * Initialize form with validation schema and default values
   */
  const form = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_CREATE_VALUES,
  });

  /**
   * Reset form when mode or product changes
   */
  useEffect(() => {
    const values =
      mode === 'create'
        ? DEFAULT_CREATE_VALUES
        : product
        ? {
            code: product.code,
            name: product.name,
            stock: product.stock,
            price: product.price,
            category_id: product.category_id.toString(),
          }
        : DEFAULT_CREATE_VALUES;

    form.reset(values);
  }, [product, mode, form]);

  /**
   * Handle form submission
   * Transforms form data to match API payload
   */
  const handleSubmit = (data: FormData) => {
    const transformedData: CreateProductPayload | UpdateProductPayload = {
      code: data.code,
      name: data.name,
      stock: data.stock,
      price: data.price,
      category_id: parseInt(data.category_id),
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
        name="code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={mode === 'edit'}
                className={mode === 'edit' ? 'bg-gray-100' : ''}
                placeholder="Enter product code (e.g., A001)"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter product name"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem
                    key={category.id}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
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
          <DialogTitle>{mode === 'create' ? 'Create Product' : 'Edit Product'}</DialogTitle>
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
