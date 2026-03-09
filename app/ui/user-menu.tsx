'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UserIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUser();

    // Close menu when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (!user) {
    return (
      <a
        href="/login"
        className="flex items-center gap-2 text-white hover:text-orange-400"
      >
        <UserIcon className="h-6 w-6" />
        <div className="hidden text-sm md:block">
          <div className="text-xs">Hello, Sign in</div>
          <div className="font-bold">Account</div>
        </div>
      </a>
    );
  }

  const firstName = user.name.split(' ')[0];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-white hover:text-orange-400"
      >
        <UserIcon className="h-6 w-6" />
        <div className="hidden text-sm md:block">
          <div className="text-xs">Hello, {firstName}</div>
          <div className="flex items-center gap-1 font-bold">
            Account & Lists
            <ChevronDownIcon className="h-3 w-3" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 p-4">
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <div className="p-2">
            <a
              href="/orders"
              className="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Your Orders
            </a>
            <a
              href="/dashboard"
              className="block rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              Admin Portal
            </a>
            <button
              onClick={handleSignOut}
              className="w-full rounded-md px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
