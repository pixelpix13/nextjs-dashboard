import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function OrderConfirmationPage() {
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
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-12 text-center shadow-md">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircleIcon className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Order Placed Successfully!</h1>
          <p className="mb-8 text-gray-600">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          {/* Order Details */}
          <div className="mb-8 rounded-lg bg-gray-50 p-6 text-left">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-medium text-gray-900">#ORD-{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-orange-600">Processing</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mb-8 text-left">
            <h3 className="mb-3 font-semibold text-gray-900">What happens next?</h3>
            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600">
              <li>You will receive an order confirmation email shortly</li>
              <li>We'll send you tracking information once your order ships</li>
              <li>You can track your order status from your account</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/orders"
              className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="inline-block rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
