import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { handleSignOut } from '@/app/lib/actions';

export default function SideNav() {
  return (
    <div className="flex h-full flex-col">
      {/* Logo Section */}
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
          <ShoppingBagIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">ShopAdmin</h1>
          <p className="text-xs text-gray-500">E-Commerce</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Menu
          </p>
          <NavLinks />
        </div>
      </div>

      {/* Sign Out Button */}
      <div className="border-t border-gray-200 p-4">
        <form action={handleSignOut}>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600">
            <PowerIcon className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
