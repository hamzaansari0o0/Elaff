'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ARROW =
  'absolute z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-navy text-white shadow-lg ring-2 ring-white transition-opacity duration-200 hover:bg-brand-navy-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-cta disabled:pointer-events-none disabled:opacity-0 sm:flex';

// A row that scrolls sideways, shared by every home page strip (product cards, category
// tiles, brand tiles). It is a plain scrollable list with scroll-snap, so it works by
// touch swipe, trackpad and keyboard with no JavaScript at all; the arrows (shown from
// `sm` up — phones swipe) add click-to-scroll, and each hides when there is nothing
// further that way.
//
// Children must be <li> elements that size themselves (a width and `flex-none`), which is
// what lets every strip be responsive in plain CSS.
export default function HomeCarousel({ label, children, trackClassName = 'gap-4', arrowTop = '40%' }) {
  const trackRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const updateArrows = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const furthest = track.scrollWidth - track.clientWidth;
    setCanGoBack(track.scrollLeft > 4);
    setCanGoForward(track.scrollLeft < furthest - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    // A ResizeObserver reports once as soon as it starts watching, which sets the first
    // arrow state, and again whenever the row is resized (window resize, new breakpoint).
    const observer = new ResizeObserver(updateArrows);
    observer.observe(track);
    track.addEventListener('scroll', updateArrows, { passive: true });

    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', updateArrows);
    };
  }, [updateArrows]);

  // Moves by whole items — as many as fit on screen — so cards land aligned, not cut off.
  function scrollPage(direction) {
    const track = trackRef.current;
    const firstItem = track?.firstElementChild;
    if (!firstItem) return;

    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = firstItem.getBoundingClientRect().width + gap;
    const perPage = Math.max(1, Math.floor((track.clientWidth + gap) / step));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    track.scrollBy({ left: direction * perPage * step, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={label}>
      {/* The vertical padding (cancelled by the negative margin) keeps card shadows and
          the hover lift from being clipped by the scroll container. */}
      <ul
        ref={trackRef}
        className={`scrollbar-hide -mx-4 -my-3 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-pl-4 px-4 py-3 sm:-mx-2 sm:scroll-pl-2 sm:px-2 ${trackClassName}`}
      >
        {children}
      </ul>

      <button
        type="button"
        aria-label={`Scroll ${label} left`}
        disabled={!canGoBack}
        onClick={() => scrollPage(-1)}
        className={`${ARROW} -left-3 lg:-left-4`}
        style={{ top: arrowTop }}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Scroll ${label} right`}
        disabled={!canGoForward}
        onClick={() => scrollPage(1)}
        className={`${ARROW} -right-3 lg:-right-4`}
        style={{ top: arrowTop }}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
