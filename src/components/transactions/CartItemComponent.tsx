import { Plus, Minus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

/**
 * Cart item structure for displaying in cart
 */
export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

/**
 * Props for CartItemComponent
 */
interface CartItemComponentProps {
  item: CartItem;
  onIncrease: (id: number) => void;
  onDecrease: (id: number) => void;
}

/**
 * Cart item component with quantity controls and price display
 * Shows product name, quantity controls, and total price
 */
export function CartItemComponent({ item, onIncrease, onDecrease }: CartItemComponentProps) {
  return (
    <div className="flex justify-between items-center mb-4 py-2">
      {/* Product Info */}
      <div className="flex flex-col">
        <span className="text-[16px] font-medium text-neutral-900">{item.name}</span>
        <span className="text-sm text-neutral-500">{formatCurrency(item.price)} each</span>
      </div>

      {/* Quantity Controls and Total */}
      <div className="flex items-center gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onDecrease(item.id)}
            className="w-6 h-6 flex items-center justify-center bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4 text-white" />
          </button>

          <span className="w-8 text-center font-medium">{item.quantity}</span>

          <button
            onClick={() => onIncrease(item.id)}
            className="w-6 h-6 flex items-center justify-center bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Total Price */}
        <span className="text-[16px] font-bold text-indigo-600 min-w-[80px] text-right">{formatCurrency(item.price * item.quantity)}</span>
      </div>
    </div>
  );
}
