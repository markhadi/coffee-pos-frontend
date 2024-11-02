'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { SearchBar } from '@/components/SearchBar';
import { ProductTable } from '@/components/products/ProductTable';
import ProductFormDialog from '@/components/products/ProductFormDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useProducts } from '@/hooks/useProduct';
import { useCategories } from '@/hooks/useCategory';
import { ProductWithCategory, CreateProductPayload, UpdateProductPayload } from '@/types/product';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { AddButton } from '@/components/ui/add-button';

/**
 * Products management page component
 * Handles CRUD operations for products and displays them in a table
 */
export default function ProductsPage() {
  /**
   * State management for search, form dialog, and delete dialog
   */
  const [search, setSearch] = useState('');
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    product: undefined as ProductWithCategory | undefined,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    product: undefined as ProductWithCategory | undefined,
  });

  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Get products data and mutation functions from custom hook
  const { query, createMutation, updateMutation, deleteMutation } = useProducts(debouncedSearch);

  // Get categories for product form
  const { query: categoriesQuery } = useCategories('');

  /**
   * Opens create product dialog
   */
  const handleCreate = () => {
    setFormDialog({ open: true, mode: 'create', product: undefined });
  };

  /**
   * Opens edit product dialog
   * @param product - Product data to edit
   */
  const handleEdit = (product: ProductWithCategory) => {
    setFormDialog({ open: true, mode: 'edit', product });
  };

  /**
   * Opens delete confirmation dialog
   * @param product - Product data to delete
   */
  const handleDelete = (product: ProductWithCategory) => {
    setDeleteDialog({ open: true, product });
  };

  /**
   * Handles form submission for create/edit product
   * @param data - Product data from form
   */
  const handleFormSubmit = async (data: CreateProductPayload | UpdateProductPayload) => {
    try {
      if (formDialog.mode === 'create') {
        // Create new product
        await createMutation.mutateAsync(data as CreateProductPayload);
        toast.success('Product created successfully');
      } else if (formDialog.product) {
        // Update existing product
        await updateMutation.mutateAsync({
          id: formDialog.product.id,
          payload: data as UpdateProductPayload,
        });
        toast.success('Product updated successfully');
      }
      // Reset form dialog state after successful operation
      setFormDialog({ open: false, mode: 'create', product: undefined });
    } catch (error: any) {
      // Handle different error scenarios
      if (error.message) {
        toast.error(error.message);
      } else if (error.response?.status === 409) {
        toast.error('Products Code Key already exists');
      } else {
        toast.error('Failed to save product');
      }
    }
  };

  /**
   * Handles product deletion confirmation
   */
  const handleDeleteConfirm = async () => {
    if (deleteDialog.product) {
      try {
        await deleteMutation.mutateAsync(deleteDialog.product.id);
        toast.success('Product deleted successfully');
        setDeleteDialog({ open: false, product: undefined });
      } catch (error: any) {
        if (error.response?.status === 400) {
          toast.error('Cannot delete this product');
        } else {
          toast.error('Failed to delete product');
          console.error('Product delete error:', error);
        }
      }
    }
  };

  // Flatten paginated data for table display
  const flatData = query.data?.pages.flatMap(page => page.data) ?? [];
  const categories = categoriesQuery.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <h1>Products</h1>

        {/* Search and Add Product section */}
        <div className="flex items-center justify-between gap-6">
          <SearchBar
            searchTerm={search}
            onSearch={setSearch}
            placeholder="Search products"
            className="w-full !mb-0"
          />
          <AddButton
            onClick={handleCreate}
            label="Add New Product"
          />
        </div>

        {/* Products Table with infinite scroll */}
        <ProductTable
          data={flatData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          fetchNextPage={query.fetchNextPage}
          isFetching={query.isFetching}
          hasNextPage={query.hasNextPage ?? false}
        />

        {/* Create/Edit Product Dialog */}
        <ProductFormDialog
          open={formDialog.open}
          mode={formDialog.mode}
          product={formDialog.product}
          onClose={() => setFormDialog({ open: false, mode: 'create', product: undefined })}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          categories={categories}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={open => setDeleteDialog(prev => ({ ...prev, open }))}
          onConfirm={handleDeleteConfirm}
          itemName={deleteDialog.product?.name || ''}
          itemType="product"
        />
      </div>
    </MainLayout>
  );
}
