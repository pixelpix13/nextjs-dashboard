'use client';

import { useEffect, useState } from 'react';
import { mergeGuestCart } from '@/app/lib/cart-utils';

export default function CartMerger() {
  const [hasMerged, setHasMerged] = useState(false);

  useEffect(() => {
    const merge = async () => {
      if (!hasMerged) {
        const success = await mergeGuestCart();
        if (success) {
          setHasMerged(true);
          // Trigger cart update to refresh the cart icon
          window.dispatchEvent(new Event('cartUpdated'));
        }
      }
    };

    // Delay slightly to ensure auth is loaded
    const timer = setTimeout(merge, 500);
    return () => clearTimeout(timer);
  }, [hasMerged]);

  return null; // This component doesn't render anything
}
