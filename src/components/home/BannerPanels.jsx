'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import InquiryDrawer from './InquiryDrawer';

gsap.registerPlugin(ScrollTrigger);

// Full-bleed, scroll-driven panel sequence: one image fills the screen at a time.
// Scrolling advances to the next panel, which slides up from the bottom to fully
// cover the current one; after the last panel, the first slides up again so the
// sequence loops. Built to work with any number of panels (2, 3, 4, ...) since
// every transition is generated from `images.length` at runtime rather than
// hardcoded.
export default function BannerPanels({ images = [], collections = [] }) {
  const rootRef = useRef(null);
  const stackRef = useRef(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  useGSAP(
    () => {
      // This component is only shown at sm (640px) and up — see the `hidden
      // sm:block` wrapper in page.js, which renders MobileBannerCarousel below
      // that. Skip the pin/measurement setup entirely on mobile widths so it
      // never runs against a display:none, zero-height section.
      if (typeof window !== 'undefined' && window.innerWidth < 640) return;

      const panelEls = gsap.utils.toArray(stackRef.current?.children || []);
      const n = panelEls.length;
      if (n === 0) return;

      // React (dev/Strict Mode) mounts effects twice; a leftover pinned ScrollTrigger
      // from the first pass — killed a tick late — throws off this section's height
      // measurement for the second pass. Clearing any stale instances first keeps
      // both passes measuring from a clean, unpinned layout.
      ScrollTrigger.getAll().forEach((st) => st.kill());

      // The site header (announcement bar + nav + trust bar) isn't sticky as a
      // whole — only the white <header> nav bar stays fixed on scroll. Measured
      // live (not hardcoded) so this stays correct across desktop/tablet/mobile,
      // where the nav's own height differs.
      const getNavHeight = () => document.querySelector('header')?.getBoundingClientRect().height || 0;

      // Pixel offsets (available viewport height *below* the sticky nav) rather
      // than yPercent — sidesteps any ambiguity from measuring percentage against
      // a panel's box while its pinned ancestor's layout is mid-transition. The
      // whole section stays invisible (via the opacity-0/invisible classes below)
      // until the load timeline reveals it, so there's nothing to flash before
      // this runs.
      const availableHeight = () => window.innerHeight - getNavHeight();
      gsap.set(rootRef.current, { height: () => availableHeight() });
      gsap.set(panelEls, { y: () => availableHeight() });
      gsap.set(panelEls[0], { y: 0, zIndex: 100 });

      // Section fade-in, once on mount.
      const loadTl = gsap.timeline();
      loadTl.to(rootRef.current, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' });

      let tl;
      if (n > 1) {
        tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: rootRef.current,
            // Pin starts once the section reaches just *below* the sticky nav —
            // not the absolute viewport top — so the banner never renders behind
            // it and its own top edge is never hidden.
            start: () => 'top top+=' + getNavHeight(),
            end: () => '+=' + availableHeight() * n,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // Window resizes trigger ScrollTrigger's own refresh automatically;
            // re-applying the section/panel height here (before start/end are
            // recalculated) keeps a tablet <-> desktop resize or a phone
            // orientation change correct instead of stuck at the old viewport size.
            onRefreshInit: () => {
              gsap.set(rootRef.current, { height: availableHeight() });
              gsap.set(panelEls, { y: availableHeight() });
              gsap.set(panelEls[0], { y: 0 });
            },
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
            { y: () => availableHeight() },
            { y: 0, duration: 0.8, immediateRender: false },
            i
          );
        }
      }

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        loadTl.kill();
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
                <img src={panel.src} alt={panel.alt || ''} className="w-full h-full object-[inherit] bg-[#05070c]" />
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
