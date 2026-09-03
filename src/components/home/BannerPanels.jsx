'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowRight } from 'lucide-react';
import InquiryDrawer from './InquiryDrawer';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Full-bleed, scroll-driven panel sequence: one image + its own text fills the screen
// at a time. Scrolling advances to the next panel, which slides up from the bottom to
// fully cover the current one; after the last panel, the first slides up again so the
// sequence loops. Built to work with any number of panels (2, 3, 4, ...) since every
// transition is generated from `images.length` at runtime rather than hardcoded.
export default function BannerPanels({ images = [], companySettings = null, collections = [] }) {
  const rootRef = useRef(null);
  const stackRef = useRef(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useGSAP(
    () => {
      const panelEls = gsap.utils.toArray(stackRef.current?.children || []);
      const n = panelEls.length;
      if (n === 0) return;

      // React (dev/Strict Mode) mounts effects twice; a leftover pinned ScrollTrigger
      // from the first pass — killed a tick late — throws off this section's height
      // measurement for the second pass. Clearing any stale instances first keeps
      // both passes measuring from a clean, unpinned layout.
      ScrollTrigger.getAll().forEach((st) => st.kill());

      // Panel 0's heading gets its own reveal, separate from the scroll-triggered
      // panels below: a masked word reveal with a slight scale, per
      // gsap.com/docs/v3/Plugins/SplitText's "Masking" section (mask: "words" wraps
      // each word in a clip-overflow element). Plays once on load, and again if you
      // scroll all the way around back to panel 0 (the wrap segment below reuses it).
      const heading0 = panelEls[0]?.querySelector('[data-panel-text]');
      const panel0Split = heading0 ? SplitText.create(heading0, { type: 'words', mask: 'words' }) : null;
      let panel0Tween = null;
      if (panel0Split) {
        gsap.set(panel0Split.words, { yPercent: 100, scale: 0.92, transformOrigin: '50% 100%' });
        panel0Tween = gsap.timeline({ paused: true }).to(panel0Split.words, {
          yPercent: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: 'power3.out',
        });
      }

      // Split panels 1..n-1's headings into characters, each with its own paused,
      // un-scrubbed reveal timeline — it plays through in full the moment its panel
      // arrives, rather than being tied frame-by-frame to scroll position, and
      // reverses (hiding again) if you scroll back past that point, so it's ready
      // to replay next time you reach it.
      // (gsap.com/docs/v3/Plugins/SplitText — "Animating Characters": type "words,
      // chars", animate .chars with y/autoAlpha/stagger. autoSplit+onSplit is used
      // here — rather than a plain SplitText.create() — because it's the pattern
      // GSAP designed to survive being torn down and re-run safely, which matters
      // in dev/Strict Mode where effects mount twice.)
      const textTweens = [panel0Tween];
      const splits = panelEls.map((panel, idx) => {
        if (idx === 0) return null; // panel 0 uses the masked reveal above instead
        const heading = panel.querySelector('[data-panel-text]');
        if (!heading) return null;
        return SplitText.create(heading, {
          type: 'words, chars',
          autoSplit: true,
          onSplit(self) {
            gsap.set(self.chars, { y: 100, autoAlpha: 0 });
            const tween = gsap.timeline({ paused: true }).to(self.chars, {
              y: 0,
              autoAlpha: 1,
              duration: 0.6,
              stagger: 0.025,
              ease: 'power3.out',
            });
            textTweens[idx] = tween;
            return tween;
          },
        });
      });

      // Pixel offsets (one viewport height) rather than yPercent — sidesteps any
      // ambiguity from measuring percentage against a panel's box while its pinned
      // ancestor's layout is mid-transition. The whole section stays invisible
      // (via the opacity-0/invisible classes below) until the load timeline
      // reveals it, so there's nothing to flash before this runs.
      const vh = window.innerHeight;
      gsap.set(panelEls, { y: vh });
      gsap.set(panelEls[0], { y: 0, zIndex: 100 });

      // Section fade-in, then panel 0's masked text reveal, once on mount.
      const loadTl = gsap.timeline();
      loadTl.to(rootRef.current, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' });
      if (panel0Tween) loadTl.add(() => panel0Tween.play(0), '-=0.3');

      let tl;
      if (n > 1) {
        tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            start: 'top top',
            end: () => '+=' + window.innerHeight * n,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: { snapTo: 1 / n, duration: 0.4, ease: 'power1.inOut' },
          },
        });

        for (let i = 0; i < n; i++) {
          const nextIndex = (i + 1) % n;

          // immediateRender: false is essential here — fromTo() otherwise applies its
          // "from" value the instant it's created, regardless of its position in the
          // timeline, which stomps panel 0's already-correct y:0 the moment the wrap
          // segment (the one that targets panel 0 again) is built.
          tl.set(panelEls[nextIndex], { zIndex: 200 + i }, i).fromTo(
            panelEls[nextIndex],
            { y: () => window.innerHeight },
            { y: 0, duration: 0.8, immediateRender: false },
            i
          );

          // Fires once as the playhead crosses this point — forward, play the text
          // in full from the start; backward (scrolling back up past this panel),
          // reverse it so it's hidden again, ready to replay. Reads textTweens[]
          // at call time (not captured earlier) since autoSplit's onSplit can
          // replace the tween after an initial resize-observer firing.
          tl.call(
            () => {
              // Deferred to the next frame: this fires from inside ScrollTrigger's
              // scrub-driven seek (itself inside Lenis's raf callback), and calling
              // .play() on a *different*, independent timeline from that call stack
              // sets it playing but the ticker never actually advances it. Kicking
              // it off a frame later — outside that nested call — works correctly.
              const direction = tl.scrollTrigger?.direction ?? 1;
              requestAnimationFrame(() => {
                const nextTextTween = textTweens[nextIndex];
                if (!nextTextTween) return;
                if (direction === 1) nextTextTween.play(0);
                else nextTextTween.reverse();
              });
            },
            null,
            i + 0.7
          );
        }
      }

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        loadTl.kill();
        textTweens.forEach((t) => t?.kill());
        splits.forEach((s) => s?.revert());
        panel0Split?.revert();
      };
    },
    { scope: rootRef, dependencies: [images.length] }
  );

  return (
    <>
      {/* Hidden until the load timeline reveals it — nothing paints (correctly
          positioned or not) until GSAP is ready to show it in one clean motion,
          which also means panels 2+ never flash into view before being pushed
          off-screen. */}
      <section
        ref={rootRef}
        className="relative w-full h-[100svh] overflow-hidden bg-[#05070c] opacity-0 invisible"
      >
        {images.length > 0 ? (
          <div ref={stackRef} className="absolute inset-0">
            {images.map((panel, i) => (
              <div key={panel.src + i} className="absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={panel.src} alt={panel.alt || ''} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/70" />

                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
                  {panel.subtitle && (
                    <p className="font-bricolage text-xs md:text-sm font-extrabold uppercase tracking-[0.3em] text-brand-cta mb-4">
                      {panel.subtitle}
                    </p>
                  )}
                  {panel.title && (
                    <h2
                      data-panel-text
                      className="font-fraunces text-white text-4xl sm:text-6xl md:text-7xl font-black uppercase leading-[1.05] tracking-tight max-w-4xl"
                    >
                      {panel.title}
                    </h2>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1017] to-[#05070c]" />
        )}

        {/* Persistent CTAs, above the panel stack, visible throughout the sequence */}
        <div className="absolute inset-x-0 bottom-10 sm:bottom-14 z-[300] flex flex-wrap items-center justify-center gap-4 px-6">
          <button
            onClick={() => setIsInquiryOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-brand-cta hover:bg-brand-cta-hover px-7 py-3.5 text-xs md:text-sm font-extrabold uppercase tracking-widest text-white shadow-[0_0_40px_-10px_rgba(13,148,136,0.7)] transition-[background-color,box-shadow] hover:-translate-y-0.5"
          >
            Send Inquiry
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] px-7 py-3.5 text-xs md:text-sm font-extrabold uppercase tracking-widest text-white/85 hover:text-white transition-colors"
          >
            Explore Full Catalog
          </Link>
        </div>
      </section>

      <InquiryDrawer isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} categories={collections} />
    </>
  );
}
