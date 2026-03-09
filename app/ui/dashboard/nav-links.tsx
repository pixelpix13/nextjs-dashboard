'use client';
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Map of links to display in the side navigation.
const links = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: 'Products',
    href: '/dashboard/products',
    icon: CubeIcon,
  },
  { 
    name: 'Orders', 
    href: '/dashboard/orders', 
    icon: ShoppingBagIcon 
  },
  { 
    name: 'Categories', 
    href: '/dashboard/categories', 
    icon: TagIcon 
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
              {
                'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md': isActive,
                'text-gray-700 hover:bg-gray-100': !isActive,
              },
            )}
          >
            <LinkIcon className="h-5 w-5" />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
