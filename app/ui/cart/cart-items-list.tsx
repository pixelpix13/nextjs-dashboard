'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/outline';
import { getGuestCart, updateGuestCartItem, removeFromGuestCart } from '@/app/lib/cart-utils';

const formatPrice = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
};

// Temporary cart type until we implement real cart functionality
type CartItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  category_name: string;
};

export default function CartItemsList() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.isGuest) {
        // Fetch guest cart from localStorage and get product details
        setIsGuest(true);
        const guestCart = getGuestCart();
        
        if (guestCart.length > 0) {
          // Fetch product details for guest cart items
          const productIds = guestCart.map(item => item.productId).join(',');
          const productsResponse = await fetch(`/api/products?ids=${productIds}`);
          const productsData = await productsResponse.json();
          
          // Map guest cart items to cart items format
          const items = guestCart.map(item => {
            const product = productsData.products?.find((p: any) => p.id === item.productId);
            return {
              id: `guest-${item.productId}`,
              product_id: item.productId.toString(),
              product_name: product?.name || 'Unknown Product',
              product_price: Number(product?.price) || 0,
              quantity: item.quantity,
              category_name: product?.category_name || 'Unknown'
            };
          });
          setCartItems(items);
        } else {
          setCartItems([]);
        }
      } else {
        setIsGuest(false);
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Try guest cart as fallback
      setIsGuest(true);
      const guestCart = getGuestCart();
      if (guestCart.length > 0) {
        try {
          const productIds = guestCart.map(item => item.productId).join(',');
          const productsResponse = await fetch(`/api/products?ids=${productIds}`);
          const productsData = await productsResponse.json();
          
          const items = guestCart.map(item => {
            const product = productsData.products?.find((p: any) => p.id === item.productId);
            return {
              id: `guest-${item.productId}`,
              product_id: item.productId.toString(),
              product_name: product?.name || 'Unknown Product',
              product_price: Number(product?.price) || 0,
              quantity: item.quantity,
              category_name: product?.category_name || 'Unknown'
            };
          });
          setCartItems(items);
        } catch (err) {
          console.error('Failed to fetch guest cart products:', err);
          setCartItems([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      if (isGuest) {
        // Update guest cart in localStorage
        const productId = parseInt(itemId.replace('guest-', ''));
        updateGuestCartItem(productId, newQuantity);
        setCartItems(items =>
          items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        // Update user cart in database
        const response = await fetch('/api/cart', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cartItemId: itemId, quantity: newQuantity })
        });

        if (response.ok) {
          setCartItems(items =>
            items.map(item =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
          );
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      if (isGuest) {
        // Remove from guest cart in localStorage
        const productId = parseInt(itemId.replace('guest-', ''));
        removeFromGuestCart(productId);
        setCartItems(items => items.filter(item => item.id !== itemId));
        // Trigger cart update event
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        // Remove from user cart in database
        const response = await fetch(`/api/cart?id=${itemId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setCartItems(items => items.filter(item => item.id !== itemId));
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product_price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <div className="mx-auto mb-4 text-6xl">🛍️</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-900">Your Shopping Cart is empty</h2>
        <p className="mb-6 text-sm text-gray-600">Your Shopping Cart lives to serve. Give it purpose — fill it with products.</p>
        <Link
          href="/"
          className="inline-block rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-gray-900 hover:bg-yellow-500"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <div className="rounded-lg bg-white shadow-md">
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <span className="text-3xl">📦</span>
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product_id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {item.product_name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500">{item.category_name}</p>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.product_price * item.quantity)}
                      </p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>

          <div className="mt-6 space-y-3 border-t border-gray-200 pt-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-lg font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-full bg-yellow-400 py-3 text-center font-semibold text-gray-900 hover:bg-yellow-500"
          >
            Proceed to Checkout ({cartItems.length} items)
          </Link>

          <Link
            href="/"
            className="mt-3 block w-full text-center text-sm text-blue-600 hover:text-orange-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
