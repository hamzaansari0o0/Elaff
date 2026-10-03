'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

const DEPTHS = [25, 50, 75, 100];

// Mounted once in the storefront layout. Sends a pageview on every route change and
// scroll-depth milestones (25/50/75/100%) once each per page. Renders nothing.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef(null);

  useEffect(() => {
    // Guard against React strict-mode double effects: one navigation = one pageview.
    // (Only the pageview is guarded — the scroll listener below must still re-attach.)
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      trackEvent('pageview', {}, pathname);
    }

    const fired = new Set();
    let ticking = false;

    function check() {
      ticking = false;
      const doc = document.documentElement;
      const total = doc.scrollHeight;
      if (!total) return;
      const pct = ((window.scrollY + window.innerHeight) / total) * 100;
      for (const d of DEPTHS) {
        if (pct >= d - 1 && !fired.has(d)) {
          fired.add(d);
          trackEvent('scroll_depth', { depth: d }, pathname);
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
