import { Plus } from 'lucide-react';

interface AddButtonProps {
  onClick: () => void;
  label: string;
}

/**
 * Reusable add button component with consistent styling
 * @component
 * @example
 * ```tsx
 * <AddButton
 *   onClick={handleCreate}
 *   label="Add New Product"
 * />
 * ```
 */
export function AddButton({ onClick, label }: AddButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-[16px] w-max h-max flex items-center gap-1 px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
    >
      <Plus
        size={24}
        strokeWidth={4}
      />
      <span className="hidden md:block md:w-max">{label}</span>
    </button>
  );
}
