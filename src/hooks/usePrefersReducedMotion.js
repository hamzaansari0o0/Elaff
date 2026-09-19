'use client';

import { useEffect, useState } from 'react';

// Continuous auto-advancing carousels (WCAG 2.2.2 "Pause, Stop, Hide") are the
// one motion pattern a CSS media guard can't reach on its own, since Swiper
// drives them via JS/inline styles rather than a CSS animation/transition.
export default function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => setPrefersReducedMotion(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);

  return prefersReducedMotion;
}
