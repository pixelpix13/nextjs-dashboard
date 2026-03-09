'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/app/lib/definitions';
import { addToGuestCart } from '@/app/lib/cart-utils';

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        setIsGuest(data.isGuest || false);
      } catch (error) {
        setIsGuest(true);
      }
    };
    checkAuth();
  }, []);

  const handleAddToCart = async () => {
    if (product.stock_quantity < 1) {
      setMessage('Product is out of stock');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      if (isGuest) {
        // Add to guest cart (localStorage)
        addToGuestCart(parseInt(product.id), quantity);
        setMessage('Added to cart successfully!');
        // Trigger a custom event to update cart icon
        window.dispatchEvent(new Event('cartUpdated'));
        setTimeout(() => setMessage(''), 3000);
      } else {
        // Add to user cart (database)
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity: quantity
          })
        });

        const data = await response.json();

        if (response.ok) {
          setMessage('Added to cart successfully!');
          // Trigger cart update event
          window.dispatchEvent(new Event('cartUpdated'));
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(data.error || 'Failed to add to cart');
        }
      }
    } catch (error) {
      setMessage('Failed to add to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (product.stock_quantity < 1) {
      setMessage('Product is out of stock');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      if (isGuest) {
        // Add to guest cart and redirect to checkout (which will require login)
        addToGuestCart(parseInt(product.id), quantity);
        router.push('/checkout');
      } else {
        // Add to cart first
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: product.id,
            quantity: quantity
          })
        });

        if (response.ok) {
          // Redirect to checkout
          router.push('/checkout');
        } else {
          const data = await response.json();
          setMessage(data.error || 'Failed to proceed');
        }
      }
    } catch (error) {
      setMessage('Failed to proceed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Quantity Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-900">Qty:</label>
        <select
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          disabled={product.stock_quantity < 1}
          className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {Array.from({ length: Math.min(product.stock_quantity, 10) }, (_, i) => i + 1).map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isLoading || product.stock_quantity < 1}
        className="w-full rounded-full bg-yellow-400 py-2 text-sm font-medium text-gray-900 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </button>

      {/* Buy Now Button */}
      <button
        onClick={handleBuyNow}
        disabled={isLoading || product.stock_quantity < 1}
        className="w-full rounded-full bg-orange-500 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Buy Now'}
      </button>

      {/* Message */}
      {message && (
        <div
          className={`rounded-md p-2 text-center text-sm ${
            message.includes('success')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
