// Guest cart utilities for localStorage
const GUEST_CART_KEY = 'guest_cart';

export interface GuestCartItem {
  productId: number;
  quantity: number;
}

// Get guest cart from localStorage
export function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error reading guest cart:', error);
    return [];
  }
}

// Save guest cart to localStorage
export function saveGuestCart(cart: GuestCartItem[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving guest cart:', error);
  }
}

// Add item to guest cart
export function addToGuestCart(productId: number, quantity: number): void {
  const cart = getGuestCart();
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  saveGuestCart(cart);
}

// Update item quantity in guest cart
export function updateGuestCartItem(productId: number, quantity: number): void {
  const cart = getGuestCart();
  const item = cart.find(item => item.productId === productId);
  
  if (item) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      const updatedCart = cart.filter(item => item.productId !== productId);
      saveGuestCart(updatedCart);
    } else {
      item.quantity = quantity;
      saveGuestCart(cart);
    }
  }
}

// Remove item from guest cart
export function removeFromGuestCart(productId: number): void {
  const cart = getGuestCart();
  const updatedCart = cart.filter(item => item.productId !== productId);
  saveGuestCart(updatedCart);
}

// Clear guest cart
export function clearGuestCart(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(GUEST_CART_KEY);
  } catch (error) {
    console.error('Error clearing guest cart:', error);
  }
}

// Merge guest cart with user cart after login
export async function mergeGuestCart(): Promise<boolean> {
  const guestCart = getGuestCart();
  
  if (guestCart.length === 0) {
    return true;
  }
  
  try {
    const response = await fetch('/api/cart/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestCart }),
    });
    
    if (response.ok) {
      clearGuestCart();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error merging guest cart:', error);
    return false;
  }
}
