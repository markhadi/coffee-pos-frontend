'use client';

import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import CategoryFormDialog from '@/components/categories/CategoryFormDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useCategories } from '@/hooks/useCategory';
import { CategoryResponse } from '@/types/category';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import { CategoriesTable } from '@/components/categories/CategoriesTable';
import { TableHeader } from '@/components/ui/table-header';

/**
 * Categories management page component
 * Handles CRUD operations for categories and displays them in a table
 */
export default function CategoriesPage() {
  /**
   * State management for search, form dialog, and delete dialog
   */
  const [search, setSearch] = useState('');
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    category: undefined as CategoryResponse | undefined,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: undefined as CategoryResponse | undefined,
  });

  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Get categories data and mutation functions from custom hook
  const { query, createMutation, updateMutation, deleteMutation } = useCategories(debouncedSearch);

  /**
   * Opens create category dialog
   */
  const handleCreate = () => {
    setFormDialog({ open: true, mode: 'create', category: undefined });
  };

  /**
   * Opens edit category dialog
   * @param category - Category data to edit
   */
  const handleEdit = (category: CategoryResponse) => {
    setFormDialog({ open: true, mode: 'edit', category });
  };

  /**
   * Opens delete confirmation dialog
   * @param category - Category data to delete
   */
  const handleDelete = (category: CategoryResponse) => {
    setDeleteDialog({ open: true, category });
  };

  /**
   * Handles form submission for create/edit category
   * @param data - Category data from form
   */
  const handleFormSubmit = async (data: { name: string }) => {
    try {
      if (formDialog.mode === 'create') {
        // Create new category
        await createMutation.mutateAsync(data);
        toast.success('Category created successfully');
      } else if (formDialog.category) {
        // Update existing category
        await updateMutation.mutateAsync({
          id: formDialog.category.id,
          payload: data,
        });
        toast.success('Category updated successfully');
      }
      // Reset form dialog state after successful operation
      setFormDialog({ open: false, mode: 'create', category: undefined });
    } catch (error: any) {
      // Handle different error scenarios
      if (error.message) {
        toast.error(error.message);
      } else if (error.response?.status === 400) {
        toast.error('Category name already exists');
      } else {
        toast.error('Failed to save category');
      }
    }
  };

  /**
   * Handles category deletion confirmation
   */
  const handleDeleteConfirm = async () => {
    if (deleteDialog.category) {
      try {
        await deleteMutation.mutateAsync(deleteDialog.category.id);
        toast.success('Category deleted successfully');
        setDeleteDialog({ open: false, category: undefined });
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  // Flatten paginated data for table display
  const flatData = query.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <h1>Categories</h1>
        <TableHeader
          searchTerm={search}
          onSearch={setSearch}
          placeholder="Search categories"
          onAdd={handleCreate}
          addButtonLabel="Add New Category"
        />

        {/* Categories Table with infinite scroll */}
        <CategoriesTable
          data={flatData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          fetchNextPage={query.fetchNextPage}
          isFetching={query.isFetching}
          hasNextPage={query.hasNextPage ?? false}
        />

        {/* Create/Edit Category Dialog */}
        <CategoryFormDialog
          open={formDialog.open}
          mode={formDialog.mode}
          category={formDialog.category}
          onClose={() => setFormDialog({ open: false, mode: 'create', category: undefined })}
          onSubmit={handleFormSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={open => setDeleteDialog(prev => ({ ...prev, open }))}
          onConfirm={handleDeleteConfirm}
          itemName={deleteDialog.category?.name || ''}
          itemType="category"
        />
      </div>
    </MainLayout>
  );
}
