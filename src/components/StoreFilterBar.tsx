'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, ArrowDownAz } from 'lucide-react';
import { useCallback } from 'react';

export default function StoreFilterBar({ availableTags }: { availableTags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentTag = searchParams.get('tag') || '';
  const currentSort = searchParams.get('sort') || '';
  const currentQuery = searchParams.get('q') || '';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-neutral-200 mb-8">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Filter className="w-4 h-4 text-neutral-500" />
        <select 
          className="bg-transparent border-none text-sm font-semibold text-neutral-700 focus:ring-0 cursor-pointer outline-none w-full sm:w-auto"
          value={currentTag}
          onChange={(e) => router.push(`/?${createQueryString('tag', e.target.value)}`)}
        >
          <option value="">All Categories</option>
          {availableTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <ArrowDownAz className="w-4 h-4 text-neutral-500" />
        <select 
          className="bg-transparent border-none text-sm font-semibold text-neutral-700 focus:ring-0 cursor-pointer outline-none w-full sm:w-auto"
          value={currentSort}
          onChange={(e) => router.push(`/?${createQueryString('sort', e.target.value)}`)}
        >
          <option value="">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
