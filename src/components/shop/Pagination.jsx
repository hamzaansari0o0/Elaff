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

// The previous / next arrow. With no page in that direction it is rendered
// without an href: as a link it used to point back at the same page (page 1's
// "previous") or at a page that doesn't exist (the last page's "next"), and
// crawlers followed it. role="link" + aria-disabled keeps it announced as a
// disabled link to screen readers.
function PageArrow({ href, label, children }) {
  const base = 'flex items-center justify-center w-9 h-9 rounded-lg border text-gray-500 transition-colors';

  if (!href) {
    return (
      <a role="link" aria-disabled="true" aria-label={label} className={`${base} pointer-events-none opacity-40 border-gray-200`}>
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={`${base} border-gray-200 bg-white hover:border-brand-navy hover:text-brand-navy`}
    >
      {children}
    </Link>
  );
}

export default function Pagination({ currentPage, totalPages, basePath = '/shop' }) {
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
    return `${basePath}${qs ? `?${qs}` : ''}`;
  }

  const pages = getPageList(currentPage, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5 mt-10">
      <PageArrow href={currentPage > 1 ? hrefFor(currentPage - 1) : undefined} label="Previous page">
        <ChevronLeft className="w-4 h-4" />
      </PageArrow>

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

      <PageArrow href={currentPage < totalPages ? hrefFor(currentPage + 1) : undefined} label="Next page">
        <ChevronRight className="w-4 h-4" />
      </PageArrow>
    </nav>
  );
}
