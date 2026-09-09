'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { PackageSearch, ArrowUpDown } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import Pagination from './Pagination';
import { startRouteLoading } from '@/lib/routeLoading';

const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  'name-asc': 'Name: A to Z',
};

export default function ShopResults({ cards, total, page, totalPages }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sort = searchParams.get('sort') || 'featured';

  // Sorting re-queries the full catalog server-side (so it's correct across every
  // page, not just the 10 products currently on screen) — changing it also resets
  // back to page 1, since "page 3 of the old order" rarely lines up with the new one.
  function handleSortChange(e) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === 'featured') {
      params.delete('sort');
    } else {
      params.set('sort', e.target.value);
    }
    params.delete('page');
    const qs = params.toString();
    startRouteLoading();
    router.push(`/shop${qs ? `?${qs}` : ''}`);
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="text-xs font-bricolage font-bold text-gray-500 uppercase tracking-widest">
          {total} {total === 1 ? 'Result' : 'Results'}
        </p>
        {total > 1 && (
          <label className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            <select
              value={sort}
              onChange={handleSortChange}
              aria-label="Sort products"
              className="bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-2 text-[11px] font-bold text-gray-700 uppercase tracking-wide outline-none focus:border-brand-navy transition-colors cursor-pointer"
            >
              {Object.entries(SORTS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {cards.length === 0 ? (
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {cards.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
