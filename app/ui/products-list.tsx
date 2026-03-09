'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type Product = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  category_name: string;
};

type ProductsListProps = {
  initialProducts: Product[];
  initialPagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  categories: Array<{ id: string; name: string }>;
};

export default function ProductsList({ initialProducts, initialPagination, categories }: ProductsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState(initialProducts);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  // Sync state with props when they change (e.g., when navigating via category links)
  useEffect(() => {
    setProducts(initialProducts);
    setPagination(initialPagination);
    setSearchTerm(searchParams.get('search') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [initialProducts, initialPagination, searchParams]);

  // Generate consistent rating count based on product ID
  const getRatingCount = (productId: string) => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = ((hash << 5) - hash) + productId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 900) + 100;
  };

  const fetchProducts = async (search: string, category: string, page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('page', page.toString());

      const response = await fetch(`/api/products/search?${params.toString()}`);
      const data = await response.json();
      
      setProducts(data.products);
      setPagination(data.pagination);
      
      // Update URL
      router.push(`/?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchTerm, selectedCategory, 1);
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fetchProducts(searchTerm, categoryId, 1);
  };

  const handlePageChange = (newPage: number) => {
    fetchProducts(searchTerm, selectedCategory, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Search Bar - Mobile */}
      <div className="mb-4 md:hidden animate-slide-in-left">
        <form onSubmit={handleSearch} className="relative group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="w-full rounded-lg border-2 border-gray-300 bg-white py-2 pl-4 pr-10 text-gray-900 transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 hover:border-blue-400"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg active:scale-95"
          >
            <MagnifyingGlassIcon className="h-5 w-5 text-white transition-transform group-hover:scale-110" />
          </button>
        </form>
      </div>

      {/* Products Count and Filters */}
      <div className="mb-4 flex items-center justify-between animate-fade-in">
        <p className="text-sm text-gray-600 font-medium">
          Showing <span className="text-blue-600 font-bold">{products.length}</span> of <span className="text-blue-600 font-bold">{pagination.totalItems}</span> products
          {selectedCategory && <span className="text-orange-600"> in {categories.find(c => c.id === selectedCategory)?.name}</span>}
        </p>
        {(searchTerm || selectedCategory) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
              fetchProducts('', '', 1);
            }}
            className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-pink-500 px-4 py-1.5 text-sm font-medium text-white transition-all duration-300 hover:from-red-600 hover:to-pink-600 hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filters
            </span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white p-3 md:p-4">
              <div className="mb-3 aspect-square rounded-md bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center text-gray-500 animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce">📦</div>
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex flex-col rounded-lg border border-gray-200 bg-white p-3 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-blue-400 md:p-4 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Product Image Placeholder */}
                <div className="mb-3 flex aspect-square items-center justify-center rounded-md bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden relative group-hover:from-blue-100 group-hover:to-indigo-200 transition-all duration-300">
                  <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                    <div className="text-5xl">📦</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col">
                  <h3 className="mb-2 line-clamp-2 text-sm text-gray-900 group-hover:text-blue-600 transition-colors duration-200 font-medium">
                    {product.name}
                  </h3>

                  {/* Rating */}
                  <div className="mb-2 flex items-center gap-1">
                    <div className="flex text-orange-400 transform group-hover:scale-110 transition-transform duration-200">
                      {'⭐️'.repeat(4)}{'☆'}
                    </div>
                    <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">({getRatingCount(product.id)})</span>
                  </div>

                  {/* Price */}
                  <div className="mb-2 flex items-baseline gap-1 group-hover:scale-105 transition-transform duration-200">
                    <span className="text-xs text-gray-500">$</span>
                    <span className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{Math.floor(Number(product.price))}</span>
                    <span className="text-xs text-gray-500">{(Number(product.price) % 1).toFixed(2).substring(1)}</span>
                  </div>

                  {/* Stock */}
                  <div className="mt-auto">
                    {product.stock_quantity > 0 ? (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                        <div>
                          <p className="text-xs text-green-600 font-medium">In Stock</p>
                          <p className="text-xs text-gray-500">Ships in 1-2 days</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-red-500"></div>
                        <p className="text-xs text-red-600 font-medium">Out of Stock</p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 animate-fade-in">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="group relative overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:border-blue-400 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
              >
                <span className="relative z-10">Previous</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>

              <div className="flex gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative overflow-hidden rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 transform hover:scale-110 ${
                          page === pagination.currentPage
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-blue-50 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <span className="relative z-10">{page}</span>
                        {page === pagination.currentPage && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse opacity-50"></div>
                        )}
                      </button>
                    );
                  } else if (
                    page === pagination.currentPage - 2 ||
                    page === pagination.currentPage + 2
                  ) {
                    return <span key={page} className="px-2 py-2 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="group relative overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-blue-50 hover:border-blue-400 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white"
              >
                <span className="relative z-10">Next</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
