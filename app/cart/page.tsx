import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import CartItemsList from '@/app/ui/cart/cart-items-list';
import CartIcon from '@/app/ui/cart-icon';

export default async function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <span className="text-2xl font-bold text-blue-900">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShopMart</span>
            </Link>
            <CartIcon />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Continue Shopping
        </Link>

        {/* Page Title */}
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Shopping Cart</h1>

        {/* Cart Items Component */}
        <CartItemsList />
      </main>
    </div>
  );
}
