'use client';

import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import MainLayout from '@/components/MainLayout';
import { SearchBar } from '@/components/SearchBar';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { UsersTable } from '@/components/users/UsersTable';
import { useDebounce } from '@/hooks/useDebounce';
import { useUsers } from '@/hooks/useUser';
import { CreateUserPayload, UpdateUserPayload, UserResponse } from '@/types/user';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Users management page component
 * Handles CRUD operations for users and displays them in a table
 */
const page = () => {
  // State for search functionality
  const [search, setSearch] = useState('');

  // State for user form dialog (create/edit)
  const [formDialog, setFormDialog] = useState({
    open: false,
    mode: 'create' as 'create' | 'edit',
    user: undefined as UserResponse | undefined,
  });

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    user: undefined as UserResponse | undefined,
  });

  // Debounce search input to prevent excessive API calls
  const debouncedSearch = useDebounce(search, 300);

  // Get users data and mutation functions from custom hook
  const { query, createMutation, updateMutation, deleteMutation } = useUsers(debouncedSearch);

  /**
   * Opens create user dialog
   */
  const handleCreate = () => {
    setFormDialog({ open: true, mode: 'create', user: undefined });
  };

  /**
   * Opens edit user dialog
   * @param user - User data to edit
   */
  const handleEdit = (user: UserResponse) => {
    setFormDialog({ open: true, mode: 'edit', user });
  };

  /**
   * Opens delete confirmation dialog
   * @param user - User data to delete
   */
  const handleDelete = (user: UserResponse) => {
    setDeleteDialog({ open: true, user });
  };

  /**
   * Handles form submission for create/edit user
   * @param data - User data from form
   */
  const handleFormSubmit = async (data: CreateUserPayload | UpdateUserPayload) => {
    try {
      if (formDialog.mode === 'create') {
        // Create new user
        await createMutation.mutateAsync(data as CreateUserPayload);
        toast.success('User created successfully');
        setFormDialog({ open: false, mode: 'create', user: undefined });
      } else if (formDialog.user) {
        // Update existing user
        const updateData = data as UpdateUserPayload;
        await updateMutation.mutateAsync({
          username: formDialog.user.username,
          payload: updateData,
        });
        toast.success('User updated successfully');
        setFormDialog({ open: false, mode: 'create', user: undefined });
      }
    } catch (error: any) {
      // Handle different error scenarios
      if (error.message) {
        toast.error(error.message);
      } else if (error.response?.status === 400) {
        toast.error('Username already exists');
      } else {
        toast.error('Failed to save user');
      }
    }
  };

  /**
   * Handles user deletion confirmation
   */
  const handleDeleteConfirm = async () => {
    if (deleteDialog.user) {
      try {
        await deleteMutation.mutateAsync(deleteDialog.user.username);
        toast.success('User deleted successfully');
        setDeleteDialog({ open: false, user: undefined });
      } catch (error: any) {
        toast.error('Failed to delete user: ' + (error.message || 'Unknown error occurred'));
      }
    }
  };

  // Flatten paginated data for table display
  const flatData = query.data?.pages.flatMap(page => page.data) ?? [];

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        <h1>Users</h1>

        {/* Search and Add User section */}
        <div className="flex items-center justify-between gap-6">
          <SearchBar
            searchTerm={search}
            onSearch={setSearch}
            placeholder="Search users"
            className="w-full !mb-0"
          />

          <button
            onClick={handleCreate}
            className="text-[16px] w-max h-max flex items-center gap-1 px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus
              size={24}
              strokeWidth={4}
            />
            <span className="hidden md:block md:w-max">Add New User</span>
          </button>
        </div>

        {/* Users Table with infinite scroll */}
        <UsersTable
          data={flatData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          fetchNextPage={query.fetchNextPage}
          isFetching={query.isFetching}
          hasNextPage={query.hasNextPage ?? false}
        />

        {/* Create/Edit User Dialog */}
        <UserFormDialog
          open={formDialog.open}
          mode={formDialog.mode}
          user={formDialog.user}
          onClose={() => setFormDialog({ open: false, mode: 'create', user: undefined })}
          onSubmit={handleFormSubmit}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialog.open}
          onOpenChange={open => setDeleteDialog(prev => ({ ...prev, open }))}
          onConfirm={handleDeleteConfirm}
          itemName={deleteDialog.user?.name || ''}
          itemType="user"
        />
      </div>
    </MainLayout>
  );
};

export default page;
