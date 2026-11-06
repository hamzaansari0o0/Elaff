'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, ChevronRight, LayoutGrid, Search, X } from 'lucide-react';
import useLockBodyScroll from '@/hooks/useLockBodyScroll';
import { categoryIcon } from '@/components/ui/categoryIcons';
import { prepareShopCategories, filterShopCategories } from '@/lib/shopCategories';

// A short list doesn't need a filter box; a long one does.
const FILTER_FROM = 8;

// One line in the list: coloured icon, name (up to two lines), product count.
function CategoryRow({ href, active, onNavigate, Icon, color, label, count, rowRef }) {
  return (
    <Link
      ref={rowRef}
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors ${
        active ? 'bg-brand-navy text-white' : 'text-gray-700 hover:bg-slate-100'
      }`}
    >
      {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-amber" />}
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white" style={{ backgroundColor: color }}>
        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <span className="line-clamp-2 min-w-0 flex-1 text-[13px] font-semibold leading-tight">{label}</span>
      {count != null && (
        <span
          className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
            active ? 'bg-white/15 text-white/80' : 'bg-slate-100 text-gray-500 group-hover:bg-white'
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

// The searchable, scrollable list shared by the desktop card and the mobile drawer. It fills
// whatever height its parent gives it and scrolls inside that, so the list can be as long as
// it needs to be without making the page, the card or the drawer longer.
function CategoryPanel({ categories, activeSlug, isAllProducts, onNavigate, listClassName = '' }) {
  const [query, setQuery] = useState('');
  const listRef = useRef(null);
  const activeRef = useRef(null);

  const matches = useMemo(() => filterShopCategories(categories, query), [categories, query]);
  const filtering = query.trim() !== '';

  // Keep the selected category in sight: when the list first appears, and again whenever the
  // selection changes (including back/forward navigation). It is centred only if it is not
  // already fully visible, so clicking a row you can see never makes the list jump.
  useEffect(() => {
    const list = listRef.current;
    const row = activeRef.current;
    if (!list || !row) return;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < list.scrollTop || bottom > list.scrollTop + list.clientHeight) {
      list.scrollTop = top - (list.clientHeight - row.offsetHeight) / 2;
    }
  }, [activeSlug, isAllProducts]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {categories.length > FILTER_FROM && (
        <label className="relative mb-2 block shrink-0">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            inputMode="search"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter categories"
            aria-label="Filter categories"
            className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2 pl-9 pr-8 text-base text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-brand-navy focus:bg-white lg:text-xs"
          />
          {filtering && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear filter"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 transition-colors hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
      )}

      {/* data-lenis-prevent: the site's smooth-scroll library would otherwise take over the
          mouse wheel and scroll the page instead of this list. */}
      <nav
        ref={listRef}
        data-lenis-prevent
        aria-label="Product categories"
        className={`thin-scrollbar relative -mr-1 min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain pr-1 ${listClassName}`}
      >
        {!filtering && (
          <CategoryRow
            rowRef={isAllProducts ? activeRef : undefined}
            href="/shop"
            active={isAllProducts}
            onNavigate={onNavigate}
            Icon={LayoutGrid}
            color="#475569"
            label="All Products"
          />
        )}
        {matches.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <CategoryRow
              key={category.slug}
              rowRef={active ? activeRef : undefined}
              href={`/shop?collection=${category.slug}`}
              active={active}
              onNavigate={onNavigate}
              Icon={categoryIcon(category.icon)}
              color={category.color}
              label={category.title}
              count={category.count}
            />
          );
        })}
        {filtering && matches.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-gray-400">No categories match &ldquo;{query.trim()}&rdquo;</p>
        )}
      </nav>
    </div>
  );
}

// Slides in from the left on phones and tablets (the desktop card is hidden below `lg`).
// Hiding is doubled up (transform + visibility) so a stuck/not-yet-applied transform can't
// leave it open and clickable on top of the page.
function MobileDrawer({ isOpen, onClose, children }) {
  useLockBodyScroll(isOpen);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[82%] max-w-sm transform flex-col bg-white shadow-2xl transition-[transform,visibility] duration-300 ease-in-out lg:hidden ${
          isOpen ? 'visible translate-x-0' : 'pointer-events-none invisible -translate-x-full'
        }`}
        aria-hidden={!isOpen}
      >
        <div className="flex shrink-0 items-center justify-between bg-brand-navy p-5 text-white">
          <span className="font-fraunces text-sm font-black uppercase tracking-wide">Categories</span>
          <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-white/10" aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-3">{children}</div>
      </aside>
    </>
  );
}

export default function ShopSidebar({ categoryCards, activeSlug, isAllProducts }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const categories = useMemo(() => prepareShopCategories(categoryCards, activeSlug), [categoryCards, activeSlug]);

  const activeLabel = isAllProducts ? 'All Products' : categories.find((c) => c.slug === activeSlug)?.title || 'Filtered';

  return (
    <>
      {/* Phones & tablets: a bar that opens the drawer */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="mb-5 flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm transition-transform active:scale-[0.99] lg:hidden"
      >
        <span className="flex items-center gap-2 text-sm font-bold text-gray-800">
          <SlidersHorizontal className="h-4 w-4 text-brand-navy" />
          Categories
        </span>
        <span className="flex min-w-0 items-center gap-1 text-xs font-bold uppercase tracking-wide text-brand-navy">
          <span className="truncate">{activeLabel}</span>
          <ChevronRight className="h-4 w-4 shrink-0" />
        </span>
      </button>

      {/* Desktop: a card that stays in view while the page scrolls. Its height is capped to the
          window, so every category is reachable by scrolling the list inside it. */}
      <aside className="hidden shrink-0 lg:block lg:w-64">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)]">
          <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-900">Categories</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-gray-500">{categories.length}</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
            <CategoryPanel categories={categories} activeSlug={activeSlug} isAllProducts={isAllProducts} />
          </div>
        </div>
      </aside>

      <MobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
        {/* Bottom padding keeps the last rows clear of the floating WhatsApp / chat buttons. */}
        <CategoryPanel
          categories={categories}
          activeSlug={activeSlug}
          isAllProducts={isAllProducts}
          onNavigate={() => setIsMobileOpen(false)}
          listClassName="pb-20"
        />
      </MobileDrawer>
    </>
  );
}
