'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { SearchBar } from '@/components/SearchBar';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentMethodTable } from '@/components/payment-methods/PaymentMethodTable';
import PaymentMethodFormDialog from '@/components/payment-methods/PaymentMethodFormDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { usePaymentMethods } from '@/hooks/usePaymentMethod';
import { PaymentMethod } from '@/types/payment-method';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

/**
 * Payment methods management page component
 * Handles CRUD operations for payment methods and displays them in a table
 */
export default function PaymentMethodsPage() {
  /**
   * State management for search, form dialog, and delete dialog
   */
  const [search, setSearch] = useState('');
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    paymentMethod: undefined as PaymentMethod | undefined,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    paymentMethod: undefined as PaymentMethod | undefined,
  });

  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Get payment methods data and mutation functions from custom hook
  const { query, createMutation, updateMutation, deleteMutation } = usePaymentMethods(debouncedSearch);

  /**
   * Opens create payment method dialog
   */
  const handleCreate = () => {
    setFormDialog({ open: true, mode: 'create', paymentMethod: undefined });
  };

  /**
   * Opens edit payment method dialog
   * @param paymentMethod - Payment method data to edit
   */
  const handleEdit = (paymentMethod: PaymentMethod) => {
    setFormDialog({ open: true, mode: 'edit', paymentMethod });
  };

  /**
   * Opens delete confirmation dialog
   * @param paymentMethod - Payment method data to delete
   */
  const handleDelete = (paymentMethod: PaymentMethod) => {
    setDeleteDialog({ open: true, paymentMethod });
  };

  /**
   * Handles form submission for create/edit payment method
   * @param data - Payment method data from form
   */
  const handleFormSubmit = async (data: { name: string; description?: string; is_active: boolean }) => {
    try {
      if (formDialog.mode === 'create') {
        // Create new payment method
        await createMutation.mutateAsync(data);
        toast.success('Payment method created successfully');
      } else if (formDialog.paymentMethod) {
        // Update existing payment method
        await updateMutation.mutateAsync({
          id: formDialog.paymentMethod.id,
          payload: data,
        });
        toast.success('Payment method updated successfully');
      }
      // Reset form dialog state after successful operation
      setFormDialog({ open: false, mode: 'create', paymentMethod: undefined });
    } catch (error: any) {
      // Handle different error scenarios
      if (error.message) {
        toast.error(error.message);
      } else if (error.response?.status === 400) {
        toast.error('Payment method name already exists');
      } else {
        toast.error('Failed to save payment method');
        console.error('Payment method save error:', error);
      }
    }
  };

  /**
   * Handles payment method deletion confirmation
   */
  const handleDeleteConfirm = async () => {
    if (deleteDialog.paymentMethod) {
      try {
        await deleteMutation.mutateAsync(deleteDialog.paymentMethod.id);
        toast.success('Payment method deleted successfully');
        setDeleteDialog({ open: false, paymentMethod: undefined });
      } catch (error: any) {
        if (error.response?.status === 400) {
          toast.error('Cannot delete this payment method');
        } else {
          toast.error('Failed to delete payment method');
          console.error('Payment method delete error:', error);
        }
      }
    }
  };

  // Flatten paginated data for table display
  const flatData = query.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <h1>Payment Methods</h1>

        {/* Search and Add Payment Method section */}
        <div className="flex items-center justify-between gap-6">
          <SearchBar
            searchTerm={search}
            onSearch={setSearch}
            placeholder="Search payment methods"
            className="w-full !mb-0"
          />
          <Button
            onClick={handleCreate}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus
              strokeWidth={4}
              className="w-4 h-4 text-white md:mr-2"
            />
            <span className="hidden md:block">Add New Payment Method</span>
          </Button>
        </div>

        {/* Payment Methods Table with infinite scroll */}
        <PaymentMethodTable
          data={flatData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          fetchNextPage={query.fetchNextPage}
          isFetching={query.isFetching}
          hasNextPage={query.hasNextPage ?? false}
        />

        {/* Create/Edit Payment Method Dialog */}
        <PaymentMethodFormDialog
          open={formDialog.open}
          mode={formDialog.mode}
          paymentMethod={formDialog.paymentMethod}
          onClose={() => setFormDialog({ open: false, mode: 'create', paymentMethod: undefined })}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={open => setDeleteDialog(prev => ({ ...prev, open }))}
          onConfirm={handleDeleteConfirm}
          itemName={deleteDialog.paymentMethod?.name || ''}
          itemType="payment method"
        />
      </div>
    </MainLayout>
  );
}
