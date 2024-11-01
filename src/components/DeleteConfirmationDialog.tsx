import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  itemType?: 'category' | 'payment method' | 'product' | 'user';
}

export default function DeleteConfirmationDialog({ open, onOpenChange, onConfirm, itemName, itemType }: DeleteConfirmationDialogProps) {
  const getDescriptionText = () => {
    const baseText = 'This action cannot be undone. This will permanently delete';

    if (itemType === 'payment method') {
      return `${baseText} payment method`;
    }

    if (itemType === 'user') {
      return `${baseText} user`;
    }

    return baseText;
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescriptionText()} <span className="font-bold">{itemName}</span> from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
