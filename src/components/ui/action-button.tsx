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
  return (
    <button
      onClick={onClick}
      className={`rounded-md bg-${variant}-500 px-3 py-1.5 text-sm font-medium text-white 
        hover:bg-${variant}-600 transition-colors focus:outline-none focus:ring-2 
        focus:ring-${variant === 'cyan' ? 'indigo' : variant}-400 focus:ring-offset-2`}
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
