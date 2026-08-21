'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ChevronRight, X } from 'lucide-react';

export default function ShopSidebar({ categoryCards, activeSlug, isAllProducts }) {
  const [isOpen, setIsOpen] = useState(false);

  const activeLabel = isAllProducts
    ? 'All Products'
    : categoryCards.find((c) => c.slug === activeSlug)?.title || 'Filtered';

  function NavLinks({ onNavigate }) {
    return (
      <nav className="flex flex-col gap-1">
        <Link
          href="/shop"
          onClick={onNavigate}
          className={`group relative flex items-center justify-between pl-4 pr-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
            isAllProducts ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-slate-50 hover:text-brand-navy'
          }`}
        >
          {isAllProducts && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-brand-amber" />}
          <span>All Products</span>
        </Link>
        {categoryCards.map((cat) => {
          const active = activeSlug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/shop?collection=${cat.slug}`}
              onClick={onNavigate}
              className={`group relative flex items-center justify-between gap-3 pl-4 pr-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                active ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-slate-50 hover:text-brand-navy'
              }`}
            >
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-brand-amber" />}
              <span className="truncate">{cat.title}</span>
              <span
                className={`shrink-0 font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  active ? 'bg-white/15 text-white/80' : 'bg-slate-100 text-gray-400 group-hover:bg-white'
                }`}
              >
                {cat.count.replace(' PRODUCTS', '')}
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <>
      {/* Mobile & tablet: trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-full flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-5 shadow-sm active:scale-[0.99] transition-transform"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <SlidersHorizontal className="w-4 h-4 text-brand-navy" />
          Product Groups
        </span>
        <span className="flex items-center gap-1 text-xs font-bold text-brand-navy uppercase tracking-wide">
          {activeLabel}
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Desktop: static sticky sidebar */}
      <aside className="hidden lg:block lg:w-64 shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:sticky lg:top-28 shadow-sm">
          <div className="flex items-center gap-2 px-2 mb-3 pb-3 border-b border-dashed border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest">Product Groups</h2>
          </div>
          <NavLinks />
        </div>
      </aside>

      {/* Mobile & tablet: off-canvas drawer */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[82%] max-w-sm bg-white z-50 lg:hidden shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 bg-brand-navy text-white sticky top-0 z-10">
          <span className="font-fraunces font-black text-sm uppercase tracking-wide">Product Groups</span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <NavLinks onNavigate={() => setIsOpen(false)} />
        </div>
      </aside>
    </>
  );
}
