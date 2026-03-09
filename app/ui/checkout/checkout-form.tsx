'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const formatPrice = (amount: number | string) => {
  return `$${Number(amount).toFixed(2)}`;
};

type CartItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  category_name: string;
};

export default function CheckoutForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      setCartItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.product_price) * item.quantity), 0);
  const tax = subtotal * 0.1;
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + tax + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const shippingInfo = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      };

      const paymentInfo = {
        cardNumber: formData.cardNumber,
        cardName: formData.cardName,
        expiryDate: formData.expiryDate,
        cvv: formData.cvv
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingInfo, paymentInfo })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to order confirmation page
        router.push('/order-confirmation');
      } else {
        alert(data.error || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Order failed:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading checkout...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow-md">
        <div className="mx-auto mb-4 text-6xl">🛒</div>
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mb-6 text-gray-600">Add some products before proceeding to checkout.</p>
        <Link
          href="/"
          className="inline-block rounded-full bg-yellow-400 px-6 py-3 font-semibold text-gray-900 hover:bg-yellow-500"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Shipping Information Form */}
        <div className="lg:col-span-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Shipping Information</h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country *
                </label>
                <select
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-6 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">Payment Information</h2>

            <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                  Card Number *
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  required
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={formData.cardNumber}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Name on Card */}
              <div>
                <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
                  Name on Card *
                </label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  required
                  value={formData.cardName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Expiry Date & CVV */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                    Expiry Date *
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    required
                    placeholder="MM/YY"
                    maxLength={5}
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV *
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    required
                    placeholder="123"
                    maxLength={4}
                    value={formData.cvv}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="rounded-md bg-blue-50 p-3">
                <p className="text-xs text-blue-700">
                  🔒 This is a demo checkout. No real payment will be processed.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-lg bg-white p-6 shadow-md">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-yellow-400 py-3 font-semibold text-gray-900 hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Place Your Order'}
            </button>

            <div className="my-4 border-t border-gray-200"></div>

            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cartItems.length}):</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping & handling:</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-gray-600">
                <span>Total before tax:</span>
                <span>{formatPrice(subtotal + shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated tax:</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold text-red-700">
                <span>Order Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 rounded bg-gray-50 p-3">
              <p className="text-xs text-gray-600">
                By placing your order, you agree to ShopMart's privacy notice and conditions of use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
