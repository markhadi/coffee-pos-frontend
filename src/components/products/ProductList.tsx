import { ProductWithCategory } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

/**
 * Props for ProductList component
 */
interface ProductListProps {
  products: ProductWithCategory[];
  addToCart: (product: ProductWithCategory) => void;
  isLoading?: boolean;
}

/**
 * Product card component for displaying individual product
 */
const ProductCard = ({ product, addToCart }: { product: ProductWithCategory; addToCart: (product: ProductWithCategory) => void }) => (
  <div className="flex flex-col p-4 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    {/* Product Info */}
    <div className="flex-1 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-slate-900">{product.name}</h3>
          <p className="text-sm text-slate-500">{product.category.name}</p>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">{product.code}</span>
      </div>
      <div className="text-lg font-semibold text-slate-900">{formatCurrency(product.price)}</div>
    </div>

    {/* Add to Cart Button */}
    <Button
      onClick={() => addToCart(product)}
      className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700"
      disabled={product.stock <= 0}
    >
      <Plus className="w-4 h-4 mr-2" />
      Add to Cart
    </Button>
  </div>
);

/**
 * Loading skeleton for product card
 */
const ProductCardSkeleton = () => (
  <div className="flex flex-col p-4 bg-white rounded-lg border border-slate-200 shadow-sm animate-pulse">
    <div className="flex-1 space-y-2">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-5 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-slate-200 rounded-full" />
      </div>
      <div className="h-7 w-24 bg-slate-200 rounded mt-2" />
      <div className="h-4 w-20 bg-slate-200 rounded" />
    </div>
    <div className="h-10 w-full bg-slate-200 rounded mt-4" />
  </div>
);

/**
 * Product list component with grid layout and loading state
 */
export default function ProductList({ products, addToCart, isLoading = false }: ProductListProps) {
  // Show loading skeleton while fetching data
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Show empty state if no products
  if (!products.length) {
    return (
      <div className="flex items-center justify-center h-48 border border-slate-200 rounded-lg">
        <p className="text-slate-500">No products available</p>
      </div>
    );
  }

  // Render product grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          addToCart={addToCart}
        />
      ))}
    </div>
  );
}
