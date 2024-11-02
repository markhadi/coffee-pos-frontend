import { ReactNode } from 'react';

/**
 * Props for the ActionButton component
 * @interface ActionButtonProps
 * @property {() => void} onClick - Function to be called when button is clicked
 * @property {'cyan' | 'rose'} variant - Button color variant, defaults to 'cyan'
 * @property {ReactNode} children - Button content/label
 */
interface ActionButtonProps {
  onClick: () => void;
  variant?: 'cyan' | 'rose';
  children: ReactNode;
}

/**
 * Reusable button component for actions with consistent styling
 * @component
 * @example
 * ```tsx
 * <ActionButton onClick={handleClick} variant="cyan">
 *   Edit
 * </ActionButton>
 * ```
 */
export function ActionButton({ onClick, variant = 'cyan', children }: ActionButtonProps) {
  const variantClasses = {
    cyan: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-indigo-400',
    rose: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-400',
  };

  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-sm font-medium text-white 
        transition-colors focus:outline-none focus:ring-2 
        focus:ring-offset-2 ${variantClasses[variant as keyof typeof variantClasses]}`}
    >
      {children}
    </button>
  );
}

/**
 * Props for the ActionButtons component
 * @interface ActionButtonsProps
 * @template T - Type of the item being acted upon
 * @property {(item: T) => void} onEdit - Function to handle edit action
 * @property {(item: T) => void} onDelete - Function to handle delete action
 * @property {T} item - The item to be edited or deleted
 */
interface ActionButtonsProps<T> {
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  item: T;
}

/**
 * Component that renders Edit and Delete buttons with consistent styling
 * Uses generic type T to ensure type safety for the item being acted upon
 *
 * @component
 * @template T - Type of the item being acted upon
 * @example
 * ```tsx
 * <ActionButtons
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   item={product}
 * />
 * ```
 */
export function ActionButtons<T>({ onEdit, onDelete, item }: ActionButtonsProps<T>) {
  return (
    <div className="flex gap-2">
      <ActionButton onClick={() => onEdit(item)}>Edit</ActionButton>
      <ActionButton
        onClick={() => onDelete(item)}
        variant="rose"
      >
        Delete
      </ActionButton>
    </div>
  );
}
