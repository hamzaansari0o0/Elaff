'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ROUTE_LOADING_START_EVENT } from '@/lib/routeLoading';

// A stuck bar (route never actually changes — e.g. navigating to the exact
// page you're already on) is worse than no bar, so it always self-clears.
const SAFETY_TIMEOUT_MS = 8000;

function RouteLoadingBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const timeoutIdsRef = useRef([]);
  const trickleIntervalRef = useRef(null);
  // Whether a navigation is in flight — a plain ref, not state, so it's
  // always up to date synchronously the instant a navigation starts and
  // can never be missed by the completion effect below (see the note on
  // `start()`).
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    function clearScheduledSteps() {
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
      if (trickleIntervalRef.current) {
        clearInterval(trickleIntervalRef.current);
        trickleIntervalRef.current = null;
      }
    }

    function start() {
      isNavigatingRef.current = true;
      clearScheduledSteps();

      // Deferred a macrotask out (not called directly here): Next's router
      // can itself call pushState from inside a useInsertionEffect during a
      // transition, and if this ever runs synchronously inside that same
      // call stack, updating state throws "useInsertionEffect must not
      // schedule updates" and appears to silently abort the navigation.
      timeoutIdsRef.current.push(
        setTimeout(() => {
          setProgress(15);
          // Keeps creeping toward — never reaching — 90% for as long as the
          // navigation takes, so a slow page load never reads as frozen
          // partway through instead of just "still working".
          trickleIntervalRef.current = setInterval(() => {
            setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.15));
          }, 300);
        }, 0)
      );

      timeoutIdsRef.current.push(
        setTimeout(() => {
          isNavigatingRef.current = false;
          clearScheduledSteps();
          setProgress(0);
        }, SAFETY_TIMEOUT_MS)
      );
    }

    // The real trigger: fires the instant the user clicks a same-origin
    // link, well before Next.js has fetched anything for the destination —
    // history.pushState/replaceState turned out to fire close to when the
    // new page is ready rather than at the start of the click, so watching
    // those alone left clicks feeling like nothing had happened yet.
    function handleDocumentClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      let url;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const current = window.location.pathname + window.location.search + window.location.hash;
      const destination = url.pathname + url.search + url.hash;
      if (destination === current) return;

      start();
    }

    // Capture phase, not bubble: next/link's own click handler can call
    // stopPropagation() once it's done intercepting the click, which would
    // stop a bubble-phase listener on document from ever seeing it. Capture
    // fires on the way down, before that's possible.
    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener(ROUTE_LOADING_START_EVENT, start);
    window.addEventListener('popstate', start);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener(ROUTE_LOADING_START_EVENT, start);
      window.removeEventListener('popstate', start);
      clearScheduledSteps();
    };
  }, []);

  // pathname/searchParams only change once Next.js has actually finished
  // rendering the destination route, so this is the real "navigation done" signal.
  useEffect(() => {
    if (!isNavigatingRef.current) return;
    isNavigatingRef.current = false;
    timeoutIdsRef.current.forEach(clearTimeout);
    if (trickleIntervalRef.current) {
      clearInterval(trickleIntervalRef.current);
      trickleIntervalRef.current = null;
    }

    const jumpToComplete = setTimeout(() => setProgress(100), 0);
    const finishTimeout = setTimeout(() => setProgress(0), 200);

    return () => {
      clearTimeout(jumpToComplete);
      clearTimeout(finishTimeout);
    };
  }, [pathname, searchParams]);

  if (progress === 0) return null;

  return (
    <div id="route-loading-bar" className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none" aria-hidden="true">
      <div
        className="h-full bg-brand-cta shadow-[0_0_10px_rgba(13,148,136,0.7)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}

// Site-wide top progress bar so a click that's about to load a new page
// never feels like it did nothing while the next page is still loading.
export default function RouteLoadingBar() {
  return (
    <Suspense fallback={null}>
      <RouteLoadingBarInner />
    </Suspense>
  );
}
