import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { UserResponse, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useBeforeUnload } from '@/hooks/useBeforeUnload';

const DEFAULT_CREATE_VALUES = { username: '', password: '', name: '', role: 'CASHIER' as const };
const DEFAULT_EDIT_VALUES = { name: '', role: 'CASHIER' as const, password: '' };

const passwordSchema = {
  create: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  update: z.union([z.string().min(6), z.string().length(0)]),
};

const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  password: passwordSchema.create,
  name: z.string().min(3),
  role: z.enum(['ADMIN', 'CASHIER']),
});

const updateUserSchema = z.object({
  name: z.string().min(3),
  role: z.enum(['ADMIN', 'CASHIER']),
  password: passwordSchema.update,
});

type CreateFormData = z.infer<typeof createUserSchema>;
type UpdateFormData = z.infer<typeof updateUserSchema>;

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void;
  user?: UserResponse;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

export function UserFormDialog({ open, onClose, onSubmit, user, mode, isLoading = false }: UserFormDialogProps) {
  const form = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(mode === 'create' ? createUserSchema : updateUserSchema),
    defaultValues:
      mode === 'create'
        ? DEFAULT_CREATE_VALUES
        : {
            name: user?.name,
            role: user?.role,
            username: user?.username,
            password: '',
          },
  });

  useEffect(() => {
    const values = mode === 'create' ? DEFAULT_CREATE_VALUES : user ? { name: user.name, role: user.role, username: user.username, password: '' } : DEFAULT_EDIT_VALUES;

    form.reset(values);
  }, [user, mode, form]);

  const handleSubmit = (data: CreateFormData | UpdateFormData) => {
    onSubmit(data);
    form.reset();
    onClose();
  };

  const isDirty = form.formState.isDirty;

  const handleClose = useCallback(() => {
    if (isDirty && window.confirm('You have unsaved changes. Are you sure you want to close?')) {
      form.reset();
      onClose();
    } else if (!isDirty) {
      onClose();
    }
  }, [isDirty, form, onClose]);

  useBeforeUnload(isDirty);

  const renderFormFields = () => (
    <>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={mode === 'edit'}
                className={mode === 'edit' ? 'bg-gray-100' : ''}
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
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CASHIER">Cashier</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Password
              {mode === 'edit' && <span className="text-sm text-gray-500">(optional)</span>}
            </FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder={mode === 'edit' ? 'Leave empty to keep current password' : 'Enter password'}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );

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
          <DialogTitle>{mode === 'create' ? 'Create User' : 'Edit User'}</DialogTitle>
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
