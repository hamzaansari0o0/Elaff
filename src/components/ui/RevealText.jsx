'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Splits text into lines, each auto-wrapped in an overflow-clipped mask (SplitText's
// `mask` option), then slides each line up out of that mask. `trigger="load"` plays
// once on mount (for above-the-fold text like the banner headline); `trigger="scroll"`
// (default) plays as the element enters the viewport, and — via `autoSplit` — re-splits
// and re-runs the reveal on resize so line breaks stay correct at any width.
export default function RevealText({ as: Tag = 'span', className = '', children, trigger = 'scroll', delay = 0 }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!ref.current) return;

      const split = SplitText.create(ref.current, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            opacity: 0,
            duration: 0.9,
            stagger: 0.07,
            ease: 'power4.out',
            delay,
            scrollTrigger:
              trigger === 'scroll' ? { trigger: ref.current, start: 'top 85%' } : undefined,
          });
        },
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [trigger, delay] }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
