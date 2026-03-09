import { getProductById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import AddToCartButton from '@/app/ui/products/add-to-cart-button';
import CartIcon from '@/app/ui/cart-icon';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

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
          Back to Products
        </Link>

        {/* Product Detail */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Image */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-lg bg-white p-6 shadow-md">
              <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-50">
                <div className="text-center">
                  <div className="text-9xl">📦</div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info & Add to Cart */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-2">
                <div className="flex text-orange-400">
                  {'⭐️'.repeat(4)}{'☆'}
                </div>
                <span className="text-sm text-blue-600 hover:text-orange-600">
                  {Math.floor(Math.random() * 1000) + 500} ratings
                </span>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-200"></div>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-600">Price:</span>
                  <div className="flex items-baseline">
                    <span className="text-sm text-red-700">$</span>
                    <span className="text-3xl font-medium text-red-700">{Math.floor(Number(product.price))}</span>
                    <span className="text-lg text-red-700">{(Number(product.price) % 1).toFixed(2).substring(1)}</span>
                  </div>
                </div>
                {product.stock_quantity > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    Save 5% with coupon <span className="text-xs">(applied at checkout)</span>
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-200"></div>

              {/* Description */}
              <div className="mb-4">
                <h2 className="mb-2 font-semibold text-gray-900">About this item</h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                  <li>{product.description || 'High-quality product with excellent features'}</li>
                  <li>Premium materials and craftsmanship</li>
                  <li>Perfect for everyday use</li>
                  <li>Category: {product.category_name}</li>
                </ul>
              </div>

              {/* Divider */}
              <div className="my-4 border-t border-gray-200"></div>

              {/* Add to Cart Section */}
              <div className="rounded-lg border border-gray-300 bg-white p-4">
                <div className="mb-3">
                  {product.stock_quantity > 0 ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircleIcon className="h-5 w-5" />
                      <span className="text-lg font-medium">In Stock</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircleIcon className="h-5 w-5" />
                      <span className="font-medium">Currently unavailable</span>
                    </div>
                  )}
                </div>

                <AddToCartButton product={product} />

                {product.stock_quantity > 0 && (
                  <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-medium">Ships from</span>
                      <span>ShopMart</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="font-medium">Sold by</span>
                      <span>ShopMart</span>
                    </div>
                    <div className="mt-3 rounded bg-gray-50 p-3">
                      <p className="text-sm font-medium text-teal-700">
                        ✓ Secure transaction
                      </p>
                      <p className="mt-1 text-xs text-gray-600">
                        Your transaction is secure. We work hard to protect your information.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-gray-900">Customers who viewed this item also viewed</h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm text-gray-600">More products from {product.category_name} category</p>
          </div>
        </div>
      </main>
    </div>
  );
}
