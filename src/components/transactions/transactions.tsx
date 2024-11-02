'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import { OrderConfirmation } from '@/components/transactions/OrderConfirmation';
import { SearchBar } from '@/components/SearchBar';
import ProductList from '@/components/products/ProductList';
import { CartItemComponent } from '@/components/transactions/CartItemComponent';
import { OrderForm } from '@/components/transactions/OrderForm';
import { useCart } from '@/hooks/useCart';
import { useTransactions } from '@/hooks/useTransaction';
import { useProducts } from '@/hooks/useProduct';
import { usePaymentMethods } from '@/hooks/usePaymentMethod';
import { ShoppingCart } from 'lucide-react';
import { ProductWithCategory } from '@/types/product';

/**
 * Form data for order submission
 */
interface FormData {
  customer: string;
  payment: string;
}

/**
 * Transactions page component
 * Handles product selection, cart management, and order creation
 */
export default function TransactionsPage() {
  /**
   * State management for search, order confirmation, and form data
   */
  const [searchTerm, setSearchTerm] = useState('');
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [serviceCharge, setServiceCharge] = useState(0);
  const [formData, setFormData] = useState<FormData | null>(null);

  // Get products and payment methods from API
  const { query: productsQuery } = useProducts(searchTerm);
  const { query: paymentMethodsQuery } = usePaymentMethods('');
  const paymentMethods = paymentMethodsQuery.data?.pages.flatMap(page => page.data) ?? [];

  // Get products data for cart
  const products = productsQuery.data?.pages.flatMap(page => page.data) ?? [];

  // Initialize cart with products
  const { cart, addToCart, decreaseQuantity, getCartTotals, resetCart } = useCart(products);
  const { createMutation } = useTransactions();

  /**
   * Handles adding product to cart
   * @param product - Product to add
   */
  const handleAddToCart = (product: ProductWithCategory) => {
    if (product.stock > 0) {
      addToCart(product.id);
    }
  };

  // Calculate cart totals with service charge
  const totals = getCartTotals(serviceCharge);

  /**
   * Handles order confirmation and submission
   * @param data - Form data with customer and payment info
   */
  const handleConfirmOrder = async (data: FormData) => {
    setFormData(data);

    const transactionPayload = {
      customer_name: data.customer,
      total_quantity: cart.reduce((sum, item) => sum + item.quantity, 0),
      total_amount: totals.totalAmount,
      payment_method_id: parseInt(data.payment),
      service_charge: serviceCharge / 100,
      transaction_items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        amount: item.price * item.quantity,
      })),
    };

    try {
      await createMutation.mutateAsync(transactionPayload);
      setIsOrderConfirmed(true);
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  /**
   * Handles dialog close and resets form state
   */
  const handleDialogClose = () => {
    setIsOrderConfirmed(false);
    setFormData(null);
    setServiceCharge(0);
    setSearchTerm('');
    resetCart();
  };

  /**
   * Gets payment method name from ID
   */
  const getPaymentMethodName = (id: string) => {
    const method = paymentMethods.find(method => method.id.toString() === id);
    return method?.name || '';
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-10 xl:flex-row">
        {/* Products Section */}
        <div className="flex-grow">
          <h1 className="mb-8">Transactions</h1>
          <SearchBar
            searchTerm={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Search Menu"
          />

          <ProductList
            products={products}
            addToCart={handleAddToCart}
            isLoading={productsQuery.isLoading}
          />

          {/* Load more button */}
          {productsQuery.hasNextPage && (
            <button
              onClick={() => productsQuery.fetchNextPage()}
              disabled={productsQuery.isFetchingNextPage}
              className="mt-4 w-full p-2 bg-indigo-600 text-white rounded-md"
            >
              {productsQuery.isFetchingNextPage ? 'Loading more...' : 'Load more'}
            </button>
          )}
        </div>

        {/* Cart Section */}
        <div className="w-full xl:max-w-[300px] h-max">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between mb-7">
              <ShoppingCart className="w-6 h-6 text-neutral-900" />
              <h2 className="text-[24px] text-neutral-900 font-bold">Cart ({cart.length})</h2>
            </div>

            {/* Empty Cart State */}
            {cart.length === 0 && (
              <div className="min-h-24 flex items-center justify-center">
                <p className="text-neutral-300 text-center">Your cart is empty.</p>
              </div>
            )}

            {/* Cart Items */}
            {cart.map(item => (
              <CartItemComponent
                key={item.id}
                item={item}
                onIncrease={() => addToCart(item.id)}
                onDecrease={() => decreaseQuantity(item.id)}
              />
            ))}

            {cart.length > 0 && <hr className="my-4" />}

            {/* Order Form */}
            <OrderForm
              cart={cart}
              serviceCharge={serviceCharge}
              onServiceChargeChange={setServiceCharge}
              onSubmit={handleConfirmOrder}
              totals={totals}
              onDialogClose={handleDialogClose}
            />
          </div>
        </div>

        {/* Order Confirmation Dialog */}
        <OrderConfirmation
          isOpen={isOrderConfirmed}
          onClose={handleDialogClose}
          cartItems={cart}
          totalAmount={totals.totalAmount}
          customer={formData?.customer || ''}
          paymentMethod={getPaymentMethodName(formData?.payment || '')}
          serviceCharge={serviceCharge}
          subtotal={totals.subtotal}
          serviceChargeAmount={totals.serviceChargeAmount}
        />
      </div>
    </MainLayout>
  );
}
