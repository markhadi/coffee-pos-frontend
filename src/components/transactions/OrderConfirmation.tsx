import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';

/**
 * Cart item structure for order confirmation
 */
interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

/**
 * Props for OrderConfirmation component
 */
interface OrderConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customer: string;
  paymentMethod: string;
  subtotal: number;
  serviceCharge: number;
  serviceChargeAmount: number;
  totalAmount: number;
}

/**
 * Order confirmation dialog component
 * Displays order details, totals, and payment information
 */
export function OrderConfirmation({ isOpen, onClose, cartItems, customer, paymentMethod, subtotal, serviceCharge, serviceChargeAmount, totalAmount }: OrderConfirmationProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="text-neutral-900">
        {/* Dialog Header with Customer Info */}
        <DialogHeader>
          <DialogTitle className="font-bold text-[32px] text-neutral-900">Order Confirmation</DialogTitle>

          {/* Customer Name */}
          <div>
            <DialogDescription className="flex gap-4 justify-between items-center text-neutral-500 text-[14px]">
              <span>Customer name</span>
              <span className="font-medium text-neutral-900">{customer}</span>
            </DialogDescription>
          </div>

          {/* Payment Method */}
          <div>
            <DialogDescription className="flex gap-4 justify-between items-center text-neutral-500 text-[14px]">
              <span>Payment method</span>
              <span className="font-medium text-neutral-900">{paymentMethod}</span>
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Items List */}
          <div className="border-t pt-4 max-h-[25vh] overflow-y-auto">
            <h4 className="font-semibold mb-2">Order Details:</h4>
            {cartItems.map(item => (
              <div
                key={item.id}
                className="flex justify-between py-1"
              >
                <span className="text-neutral-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="border-t pt-4 space-y-2">
            {/* Subtotal */}
            <div className="flex justify-between text-neutral-600">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {/* Service Charge */}
            <div className="flex justify-between text-neutral-600">
              <span>Service Charge ({serviceCharge}%):</span>
              <span className="font-medium">{formatCurrency(serviceChargeAmount)}</span>
            </div>

            {/* Total Amount */}
            <div className="flex justify-between font-bold text-neutral-900">
              <span>Total Amount:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Dialog Footer */}
        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
