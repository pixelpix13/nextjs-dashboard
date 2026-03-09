import { getAllProducts, getAllCategories } from '@/app/lib/data';
import { formatCurrency } from '@/app/lib/utils';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import CartIcon from '@/app/ui/cart-icon';
import UserMenu from '@/app/ui/user-menu';
import CartMerger from '@/app/ui/cart-merger';

export default async function HomePage() {
  const products = await getAllProducts();
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Merger - merges guest cart after login */}
      <CartMerger />
      
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
                <span className="text-2xl font-bold text-blue-900">S</span>
              </div>
              <span className="text-xl font-bold text-white">ShopMart</span>
            </Link>

            {/* Search Bar */}
            <div className="hidden flex-1 max-w-2xl mx-8 md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-lg bg-orange-500 px-4 hover:bg-orange-600">
                  <MagnifyingGlassIcon className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Right Side Links */}
            <div className="flex items-center gap-6">
              <UserMenu />
              <CartIcon />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="border-t border-blue-800 bg-blue-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 overflow-x-auto py-2">
              <Link href="/" className="whitespace-nowrap text-sm font-medium text-white hover:text-orange-400">
                All Products
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/?category=${category.id}`}
                  className="whitespace-nowrap text-sm font-medium text-white hover:text-orange-400"
                >
                  {category.name}
                </Link>
              ))}

            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold md:text-4xl">Welcome to ShopMart</h1>
            <p className="mt-2 text-lg">Discover amazing products at great prices</p>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Featured Products</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {products.slice(0, 20).map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group flex flex-col rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-md"
            >
              {/* Product Image Placeholder */}
              <div className="mb-2 flex aspect-square items-center justify-center rounded-md bg-gray-50">
                <div className="text-center">
                  <div className="text-5xl">📦</div>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-1 flex-col">
                <h3 className="mb-1 line-clamp-2 text-sm text-gray-900 group-hover:text-orange-600">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="mb-1 flex items-center gap-1">
                  <div className="flex text-orange-400">
                    {'⭐️'.repeat(4)}{'☆'}
                  </div>
                  <span className="text-xs text-gray-500">({Math.floor(Math.random() * 1000) + 100})</span>
                </div>

                {/* Price */}
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="text-xs text-gray-500">$</span>
                  <span className="text-xl font-medium text-gray-900">{Math.floor(Number(product.price))}</span>
                  <span className="text-xs text-gray-500">{(Number(product.price) % 1).toFixed(2).substring(1)}</span>
                </div>

                {/* Stock & Prime */}
                <div className="mt-auto">
                  {product.stock_quantity > 0 ? (
                    <div>
                      <p className="text-xs text-green-600">In Stock</p>
                      <p className="text-xs text-gray-500">Ships in 1-2 days</p>
                    </div>
                  ) : (
                    <p className="text-xs text-red-600">Out of Stock</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* More Products Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">More Products</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {products.slice(10, 14).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
              >
                <div className="flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-md bg-gray-50">
                  <div className="text-4xl">📦</div>
                </div>
                <div className="flex flex-1 flex-col">
                  <h3 className="mb-1 line-clamp-2 font-medium text-gray-900 hover:text-orange-600">
                    {product.name}
                  </h3>
                  <div className="mb-2 flex items-center gap-1">
                    <div className="flex text-sm text-orange-400">
                      {'⭐️'.repeat(4)}{'☆'}
                    </div>
                    <span className="text-sm text-gray-500">({Math.floor(Math.random() * 1000) + 100})</span>
                  </div>
                  <div className="text-2xl font-medium text-gray-900">{formatCurrency(product.price)}</div>
                  <p className="mt-1 text-sm text-green-600">{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-gray-900 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">© 2026 ShopMart. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-400">Your one-stop shop for everything</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
