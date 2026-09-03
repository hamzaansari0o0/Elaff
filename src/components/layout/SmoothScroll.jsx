'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Keeps GSAP's ScrollTrigger in sync with Lenis's smoothed scroll position —
// without this, ScrollTrigger reads the native (unsmoothed) scrollTop and
// scroll-driven animations across the site fire a frame or two out of step.
function LenisScrollTriggerSync() {
  const lenis = useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    if (!lenis) return;

    function raf(time) {
      lenis.raf(time * 1000);
    }

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => gsap.ticker.remove(raf);
  }, [lenis]);

  return null;
}

// Mounted in the storefront layout so momentum scrolling covers every public
// page (home, shop, product, collections, contact, cart) — not /admin, which
// keeps native scroll for its tables/forms.
export default function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1, duration: 1.2, smoothWheel: true }}>
      <LenisScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
