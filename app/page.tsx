import { getProductsWithFilters, getAllCategories } from '@/app/lib/data';
import Link from 'next/link';
import CartIcon from '@/app/ui/cart-icon';
import UserMenu from '@/app/ui/user-menu';
import CartMerger from '@/app/ui/cart-merger';
import ProductsList from '@/app/ui/products-list';
import SearchBar from '@/app/ui/search-bar';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || '';
  const category = params.category || '';
  const page = parseInt(params.page || '1');

  const { products, pagination } = await getProductsWithFilters({
    search,
    categoryId: category,
    page,
    itemsPerPage: 10,
  });
  
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Merger - merges guest cart after login */}
      <CartMerger />
      
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 shadow-lg animate-slide-in-left">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="group flex flex-shrink-0 items-center gap-2 transition-transform duration-300 hover:scale-105">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:rotate-12">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">S</span>
              </div>
              <span className="text-xl font-bold text-white transition-all duration-300 group-hover:text-orange-400">ShopMart</span>
            </Link>

            {/* Search Bar */}
            <SearchBar initialSearch={search} />

            {/* Right Side Links */}
            <div className="flex flex-shrink-0 items-center gap-4 md:gap-6">
              <UserMenu />
              <CartIcon />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="border-t border-blue-800 bg-gradient-to-r from-blue-900 to-indigo-900">
          <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 overflow-x-auto py-2 scrollbar-hide">
              <Link 
                href="/" 
                className={`group relative whitespace-nowrap text-sm font-medium transition-all duration-300 pb-1 ${
                  !category 
                    ? 'text-orange-400 scale-105' 
                    : 'text-white hover:text-orange-400 hover:scale-105'
                }`}
              >
                <span className="relative z-10">All Products</span>
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-300 ${
                  !category ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></div>
              </Link>
              {categories.map((cat, index) => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.id}`}
                  className={`group relative whitespace-nowrap text-sm font-medium transition-all duration-300 pb-1 animate-slide-in-right ${
                    category === cat.id 
                      ? 'text-orange-400 scale-105' 
                      : 'text-white hover:text-orange-400 hover:scale-105'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="relative z-10">{cat.name}</span>
                  <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-300 ${
                    category === cat.id ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-12 text-white">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-4 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute -right-4 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold md:text-5xl animate-fade-in bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Welcome to ShopMart
            </h1>
            <p className="mt-3 text-lg md:text-xl animate-slide-in-right font-light">
              Discover amazing products at great prices
            </p>
            <div className="mt-6 flex justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <span className="text-2xl">🚚</span>
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <span className="text-2xl">⭐</span>
                <span className="text-sm font-medium">Best Prices</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <span className="text-2xl">🎁</span>
                <span className="text-sm font-medium">Great Deals</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <main className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          {search ? `Search results for "${search}"` : 'Featured Products'}
        </h2>

        <ProductsList 
          initialProducts={products as any[]} 
          initialPagination={pagination} 
          categories={categories}
        />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-200 bg-gray-900 py-8 text-white">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm">© 2026 ShopMart. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-400">Your one-stop shop for everything</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
