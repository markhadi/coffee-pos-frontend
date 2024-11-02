import { SearchBar } from '@/components/SearchBar';
import { AddButton } from './add-button';

interface TableHeaderProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  placeholder: string;
  onAdd: () => void;
  addButtonLabel: string;
}

/**
 * Component that combines search bar and add button for table headers
 * @component
 * @example
 * ```tsx
 * <TableHeader
 *   searchTerm={search}
 *   onSearch={setSearch}
 *   placeholder="Search products"
 *   onAdd={handleCreate}
 *   addButtonLabel="Add New Product"
 * />
 * ```
 */
export function TableHeader({ searchTerm, onSearch, placeholder, onAdd, addButtonLabel }: TableHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <SearchBar
        searchTerm={searchTerm}
        onSearch={onSearch}
        placeholder={placeholder}
        className="w-full !mb-0"
      />
      <AddButton
        onClick={onAdd}
        label={addButtonLabel}
      />
    </div>
  );
}
