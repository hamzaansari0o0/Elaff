'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Always shows first, last, current page and its neighbors, collapsing any
// gap into a single "…" so this stays compact even with dozens of pages.
function getPageList(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const withGaps = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) withGaps.push('...');
    withGaps.push(p);
  });
  return withGaps;
}

export default function Pagination({ currentPage, totalPages }) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function hrefFor(page) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return `/shop${qs ? `?${qs}` : ''}`;
  }

  const pages = getPageList(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-10">
      <Link
        href={hrefFor(currentPage - 1)}
        aria-disabled={currentPage === 1}
        aria-label="Previous page"
        className={`flex items-center justify-center w-9 h-9 rounded-lg border text-gray-500 transition-colors ${
          currentPage === 1
            ? 'pointer-events-none opacity-40 border-gray-200'
            : 'border-gray-200 bg-white hover:border-brand-navy hover:text-brand-navy'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`gap-${i}`} className="w-9 h-9 flex items-center justify-center text-xs text-gray-400">
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={hrefFor(p)}
            aria-current={p === currentPage ? 'page' : undefined}
            className={`flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
              p === currentPage
                ? 'bg-brand-navy text-white shadow-sm'
                : 'text-gray-600 border border-gray-200 bg-white hover:border-brand-navy hover:text-brand-navy'
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={hrefFor(currentPage + 1)}
        aria-disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`flex items-center justify-center w-9 h-9 rounded-lg border text-gray-500 transition-colors ${
          currentPage === totalPages
            ? 'pointer-events-none opacity-40 border-gray-200'
            : 'border-gray-200 bg-white hover:border-brand-navy hover:text-brand-navy'
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  );
}
