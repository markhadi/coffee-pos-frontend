import { useMemo } from 'react';
import { PaymentMethod } from '@/types/payment-method';
import { formatDate } from '@/lib/utils';
import { createColumnHelper } from '@/hooks/useVirtualTable';
import { VirtualTable } from '@/components/ui/virtual-table';
import { ActionButtons } from '@/components/ui/action-button';

const columnHelper = createColumnHelper<PaymentMethod>();

interface TableCustomMeta {
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (paymentMethod: PaymentMethod) => void;
}

interface PaymentMethodTableProps {
  data: PaymentMethod[];
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (paymentMethod: PaymentMethod) => void;
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
  columnHelper.accessor('description', {
    header: 'Description',
    size: 250,
    cell: info => info.getValue() ?? '-',
  }),
  columnHelper.accessor('is_active', {
    header: 'Status',
    size: 100,
    cell: info => <span className={`px-2 py-1 rounded-full text-xs font-medium ${info.getValue() ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{info.getValue() ? 'Active' : 'Inactive'}</span>,
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
      const paymentMethod = props.row.original;
      if (!paymentMethod?.id) return null;

      return (
        <ActionButtons
          onEdit={meta.onEdit}
          onDelete={meta.onDelete}
          item={paymentMethod}
        />
      );
    },
  }),
];

export function PaymentMethodTable({ data = [], onEdit, onDelete, fetchNextPage, isFetching, hasNextPage }: PaymentMethodTableProps) {
  const columns = useMemo(() => createTableColumns({ onEdit, onDelete }), [onEdit, onDelete]);

  return (
    <VirtualTable
      data={data}
      columns={columns}
      entityName="payment methods"
      meta={{ onEdit, onDelete }}
      fetchNextPage={fetchNextPage}
      isFetching={isFetching}
      hasNextPage={hasNextPage}
    />
  );
}
