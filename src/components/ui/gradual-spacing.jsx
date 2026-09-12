'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// Letter-by-letter reveal — each character starts faded out and offset, then
// settles into place with a short stagger. Exposed as an imperative ref
// (`.play()` / `.reset()`) instead of a prop-driven trigger so callers can
// restart it on demand — e.g. every time its panel becomes active — without
// forcing a re-render, matching how the rest of the banner's text reveals
// (see BannerPanels.jsx) are controlled.
const GradualSpacing = forwardRef(function GradualSpacing(
  { text, className = '', duration = 0.5, stagger = 0.04 },
  ref
) {
  const containerRef = useRef(null);
  const tlRef = useRef(null);

  useGSAP(
    () => {
      const chars = containerRef.current?.children;
      if (!chars || chars.length === 0) return;

      const tl = gsap.timeline({ paused: true });
      tl.from(chars, { opacity: 0, x: -16, duration, stagger, ease: 'power2.out' });
      // Force the paused timeline to render its frame-0 (hidden) state now —
      // otherwise nothing here shows as hidden until the first time it plays.
      tl.render(0, true, true);
      tlRef.current = tl;

      return () => tl.kill();
    },
    { scope: containerRef, dependencies: [text, duration, stagger] }
  );

  useImperativeHandle(ref, () => ({
    play: () => tlRef.current?.restart(),
    reset: () => tlRef.current?.pause(0),
  }));

  return (
    <span ref={containerRef} className={className}>
      {text.split('').map((char, i) => (
        <span key={i} className="inline-block">
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </span>
  );
});

export { GradualSpacing };
export default GradualSpacing;
