import { useMemo } from 'react';
import { CategoryResponse } from '@/types/category';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

const columnHelper = createColumnHelper<CategoryResponse>();

interface TableCustomMeta {
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
}

interface CategoriesTableProps {
  data: CategoryResponse[];
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasNextPage: boolean;
}

const createTableColumns = (meta: TableCustomMeta) => [
  columnHelper.display({
    id: 'index',
    header: 'No',
    size: 70,
    cell: props => props.row.index + 1,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    size: 150,
    cell: props => {
      const category = props.row.original;
      if (!category?.id) return null;

      return (
        <ActionButtons
          onEdit={meta.onEdit}
          onDelete={meta.onDelete}
          item={category}
        />
      );
    },
  }),
];

export function CategoriesTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: CategoriesTableProps) {
  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      height={300}
      entityName="categories"
      meta={{ onEdit, onDelete }}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
