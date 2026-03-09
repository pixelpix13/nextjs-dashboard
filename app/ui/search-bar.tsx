'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to page 1 on new search
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="hidden flex-1 max-w-2xl mx-8 md:block group">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for products..."
          className="w-full rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm py-2 pl-4 pr-10 text-white placeholder-white/70 transition-all duration-300 focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-400/30 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500 hover:bg-white/20"
        />
        <button 
          type="submit"
          className="absolute right-0 top-0 flex h-full items-center justify-center rounded-r-lg bg-gradient-to-r from-orange-500 to-orange-600 px-4 transition-all duration-300 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <MagnifyingGlassIcon className="h-5 w-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
        </button>
      </div>
    </form>
  );
}
