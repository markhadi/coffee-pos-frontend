import { useMemo } from 'react';
import { ProductWithCategory } from '@/types/product';
import { formatDate, formatCurrency } from '@/lib/utils';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

const columnHelper = createColumnHelper<ProductWithCategory>();

interface TableCustomMeta {
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
}

interface ProductTableProps {
  data: ProductWithCategory[];
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
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
  columnHelper.accessor('code', {
    header: 'Code',
    size: 120,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('category.name', {
    header: 'Category',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('stock', {
    header: 'Stock',
    size: 100,
    cell: info => info.getValue()?.toLocaleString() ?? '0',
  }),
  columnHelper.accessor('price', {
    header: 'Price',
    size: 120,
    cell: info => formatCurrency(info.getValue() ?? 0),
  }),
  columnHelper.accessor('created_at', {
    header: 'Created At',
    size: 200,
    cell: info => formatDate(info.getValue()),
  }),
  columnHelper.accessor('updated_at', {
    header: 'Updated At',
    size: 200,
    cell: info => formatDate(info.getValue()),
  }),
  columnHelper.accessor('created_by_username', {
    header: 'Created By',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('updated_by_username', {
    header: 'Updated By',
    size: 150,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    size: 150,
    cell: props => {
      const product = props.row.original;
      if (!product?.id) return null;

      return (
        <ActionButtons
          onEdit={meta.onEdit}
          onDelete={meta.onDelete}
          item={product}
        />
      );
    },
  }),
];

export function ProductTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: ProductTableProps) {
  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      entityName="products"
      meta={{ onEdit, onDelete }}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
