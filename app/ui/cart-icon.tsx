'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { getGuestCart } from '@/app/lib/cart-utils';

export default function CartIcon() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
    
    // Listen for cart update events
    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Refresh cart count every 5 seconds
    const interval = setInterval(fetchCartCount, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.isGuest) {
        // Get count from localStorage
        const guestCart = getGuestCart();
        const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(count);
      } else {
        // Get count from API
        const count = data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setCartCount(count);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
      // Fallback to guest cart
      const guestCart = getGuestCart();
      const count = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);
    }
  };

  return (
    <Link href="/cart" className="relative flex items-center gap-2 text-white hover:text-orange-400">
      <ShoppingCartIcon className="h-6 w-6" />
      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold">
        {cartCount}
      </span>
      <span className="hidden font-bold md:block">Cart</span>
    </Link>
  );
}
