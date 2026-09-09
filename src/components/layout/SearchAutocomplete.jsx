'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2 } from 'lucide-react';
import { startRouteLoading } from '@/lib/routeLoading';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

// Bolds the first occurrence of `query` inside `text`, case-insensitively —
// matches the actual search (case-insensitive) rather than assuming the
// casing the user typed.
function HighlightedTitle({ text, query }) {
  const idx = text.toLowerCase().indexOf(query.trim().toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-brand-cta">{text.slice(idx, idx + query.trim().length)}</span>
      {text.slice(idx + query.trim().length)}
    </>
  );
}

// Live "search as you type" box used in both the desktop and mobile navbar.
// Each instance (desktop/mobile) manages its own independent state — they're
// separate mounted components, not a shared one toggled by CSS.
export default function SearchAutocomplete({ inputClassName, formClassName, buttonClassName, placeholder, onNavigate }) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Click/tap outside closes the dropdown without submitting anything.
  useEffect(() => {
    function handleOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    // setIsLoading/setSuggestions all live inside this callback (not the
    // effect body directly) so the debounce actually delays the fetch
    // instead of just delaying when a synchronous update fires.
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        setSuggestions(data.products || []);
        setHighlightedIndex(-1);
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function goToProduct(slug) {
    setIsOpen(false);
    setQuery('');
    onNavigate?.();
    startRouteLoading();
    router.push(`/product/${slug}`);
  }

  function submitFullSearch(rawQuery) {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;
    setIsOpen(false);
    onNavigate?.();
    startRouteLoading();
    router.push(`/shop?search=${encodeURIComponent(trimmed)}`);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      goToProduct(suggestions[highlightedIndex].slug);
    } else {
      submitFullSearch(query);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      return;
    }
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    }
  }

  const trimmedQuery = query.trim();
  const showDropdown = isOpen && trimmedQuery.length >= MIN_QUERY_LENGTH;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={handleSubmit} className={formClassName} role="search">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => trimmedQuery.length >= MIN_QUERY_LENGTH && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-label="Search products"
        />
        <button type="submit" className={buttonClassName} aria-label="Search">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {showDropdown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
        >
          {suggestions.length === 0 && !isLoading ? (
            <p className="px-4 py-4 text-xs font-medium text-gray-500">
              No products found for &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            <>
              {suggestions.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={idx === highlightedIndex}
                  onClick={() => goToProduct(p.slug)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    idx === highlightedIndex ? 'bg-slate-50' : ''
                  }`}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-slate-50">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-800">
                      <HighlightedTitle text={p.title} query={trimmedQuery} />
                    </p>
                    <p className="truncate text-[11px] text-gray-400">
                      {p.category}
                      {p.price ? ` · ${p.price}` : ''}
                    </p>
                  </div>
                </button>
              ))}

              <button
                type="button"
                onClick={() => submitFullSearch(query)}
                className="block w-full border-t border-gray-100 px-4 py-2.5 text-left text-xs font-bold text-brand-cta hover:bg-slate-50 transition-colors"
              >
                View all results for &ldquo;{trimmedQuery}&rdquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
