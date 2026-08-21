'use client';

import { useMemo, useState } from 'react';
import { PackageSearch, ArrowUpDown } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

const SORTS = {
  featured: { label: 'Featured', fn: null },
  'price-asc': { label: 'Price: Low to High', fn: (a, b) => (a.priceValue ?? Infinity) - (b.priceValue ?? Infinity) },
  'price-desc': { label: 'Price: High to Low', fn: (a, b) => (b.priceValue ?? -Infinity) - (a.priceValue ?? -Infinity) },
  'name-asc': { label: 'Name: A to Z', fn: (a, b) => a.title.localeCompare(b.title) },
};

export default function ShopResults({ cards }) {
  const [sort, setSort] = useState('featured');

  const sorted = useMemo(() => {
    const fn = SORTS[sort]?.fn;
    if (!fn) return cards;
    return [...cards].sort(fn);
  }, [cards, sort]);

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-xs font-bricolage font-bold text-gray-500 uppercase tracking-widest">
          {cards.length} {cards.length === 1 ? 'Result' : 'Results'}
        </p>
        {cards.length > 1 && (
          <label className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide outline-none focus:border-brand-navy transition-colors cursor-pointer"
            >
              {Object.entries(SORTS).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
            <PackageSearch className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-bold text-gray-800">No products found</p>
          <p className="text-xs text-gray-400 max-w-xs">
            Try browsing a different category or adjusting your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
          {sorted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
