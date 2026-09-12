'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ArrowRight, Globe2, Plane } from 'lucide-react';
import InquiryDrawer from './InquiryDrawer';
import { GradualSpacing } from '@/components/ui/gradual-spacing';
import { CATEGORY_THEME, DEFAULT_THEME } from './bannerTheme';

gsap.registerPlugin(ScrollTrigger, SplitText);

// How long (in timeline "segments", where each segment is 1 unit) each
// panel's slide-up takes to fully cover the previous one — must match the
// `duration` used in the `.fromTo()` calls below, since the text-reveal
// logic uses this same number to know when a panel has *finished* sliding
// into place rather than just started covering the screen.
const SLIDE_DURATION = 0.8;

// Full-bleed, scroll-driven panel sequence: one image fills the screen at a time.
// Scrolling advances to the next panel, which slides up from the bottom to fully
// cover the current one; the sequence stops at the last panel (it does not loop
// back to the first). Built to work with any number of panels (2, 3, 4, ...)
// since every transition is generated from `images.length` at runtime rather
// than hardcoded.
export default function BannerPanels({ images = [], collections = [] }) {
  const rootRef = useRef(null);
  const stackRef = useRef(null);
  const titleRefs = useRef([]);
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

      // --- Per-panel text reveal ---------------------------------------
      // Each panel's eyebrow/title/subtitle gets its own independent, paused
      // timeline (built with autoSplit + onSplit, which survives React
      // Strict Mode's double-effect-invoke in dev — a plain SplitText.create()
      // gets corrupted by that). `textTimelineRefs[i].current` always points
      // at the *current* timeline for panel i (onSplit re-runs and replaces
      // it on resize, since line breaks can change).
      const textTimelineRefs = panelEls.map(() => ({ current: null }));
      // Reverted in this effect's cleanup below — without that, Strict Mode's
      // double-effect-invoke in dev would split already-split DOM content on
      // the second pass, corrupting the markup and leaving stale timelines
      // referencing detached elements.
      const textSplits = [];

      panelEls.forEach((panelEl, i) => {
        const eyebrowEl = panelEl.querySelector('[data-banner-eyebrow]');
        const subtitleEl = panelEl.querySelector('[data-banner-subtitle]');
        if (!subtitleEl) return;

        const split = SplitText.create([subtitleEl], {
          type: 'lines',
          mask: 'lines',
          autoSplit: true,
          onSplit(self) {
            const revealTl = gsap.timeline({ paused: true });
            if (eyebrowEl) {
              revealTl
                .set(eyebrowEl, { autoAlpha: 0, y: 14 })
                .to(eyebrowEl, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' });
            }
            revealTl.from(
              self.lines,
              { yPercent: 110, opacity: 0, scale: 1.04, duration: 0.85, stagger: 0.09, ease: 'power4.out' },
              eyebrowEl ? '-=0.25' : 0
            );
            // A paused timeline doesn't auto-render its first frame just by
            // being created (only a played/sought one does) — without this,
            // every panel except the one played immediately on load (panel 0)
            // would sit with none of its "hidden" .set()/.from() state ever
            // applied, showing raw, unanimated text instead of nothing.
            // .pause(0) alone doesn't force this — GSAP treats a freshly-
            // created timeline as already "at time 0" and skips re-rendering
            // it as a no-op, so nothing here would show as hidden until the
            // first time it's actually played. .render(...) bypasses that.
            revealTl.render(0, true, true);
            textTimelineRefs[i].current = revealTl;
            return revealTl;
          },
        });
        textSplits.push(split);
      });

      let activePanel = 0;
      function playText(idx) {
        textTimelineRefs[idx]?.current?.restart();
        titleRefs.current[idx]?.play();
      }
      function resetText(idx) {
        textTimelineRefs[idx]?.current?.pause(0);
        titleRefs.current[idx]?.reset();
      }

      // Section fade-in, once on mount — the first panel's text plays right
      // alongside it, deferred a frame since GSAP's ticker won't reliably
      // advance a timeline played synchronously from inside another
      // animation's setup.
      const loadTl = gsap.timeline();
      loadTl.to(rootRef.current, { autoAlpha: 1, duration: 0.7, ease: 'power2.out' });
      requestAnimationFrame(() => playText(0));

      // Number of slide-up transitions — one less than the panel count, since
      // the last panel simply stays put instead of being covered by a
      // wrapped-around panel 0 (see the comment at the top of the file).
      const transitions = n - 1;

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
            end: () => '+=' + availableHeight() * transitions,
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
            snap: { snapTo: 1 / transitions, duration: 0.4, ease: 'power1.inOut' },
            // Recomputed on every scroll tick from the *current* scrub
            // position — not a one-shot forward/backward callback — so it
            // self-corrects regardless of scroll direction or speed instead
            // of relying on crossing an exact timeline position in each
            // direction separately. Only acts when the settled panel
            // actually changes, so this stays cheap on every tick.
            onUpdate: () => {
              const t = tl.progress() * transitions;
              const segment = Math.min(transitions - 1, Math.floor(t));
              const localT = t - segment;
              // Once a panel's slide-up has fully finished (localT past
              // SLIDE_DURATION), *it* is the one fully covering the screen;
              // before that point, the previous panel (still more visible
              // than the one still sliding in) is the settled one.
              const settled = localT >= SLIDE_DURATION ? segment + 1 : segment;
              if (settled !== activePanel) {
                const previous = activePanel;
                activePanel = settled;
                resetText(previous);
                requestAnimationFrame(() => playText(settled));
              }
            },
          },
        });

        for (let i = 0; i < transitions; i++) {
          const nextIndex = i + 1;

          // immediateRender: false is essential here — fromTo() otherwise applies its
          // "from" value the instant it's created, regardless of its position in the
          // timeline.
          tl.set(panelEls[nextIndex], { zIndex: 200 + i }, i).fromTo(
            panelEls[nextIndex],
            { y: () => availableHeight() },
            { y: 0, duration: SLIDE_DURATION, immediateRender: false },
            i
          );
        }
      }

      return () => {
        tl?.scrollTrigger?.kill();
        tl?.kill();
        loadTl.kill();
        textTimelineRefs.forEach((ref) => ref.current?.kill());
        textSplits.forEach((split) => split.revert());
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
            {images.map((panel, i) => {
              const theme = CATEGORY_THEME[panel.theme] || DEFAULT_THEME;
              return (
                <div key={panel.src + i} className="absolute inset-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={panel.src} alt={panel.alt || ''} className="w-full h-full object-[inherit] bg-[#05070c]" />

                  {(panel.title || panel.subtitle) && (
                    <div className="absolute top-0 left-0 right-0 z-[120] px-6 sm:px-10 md:px-14 pt-8 sm:pt-12 md:pt-16 pointer-events-none">
                      <div
                        data-banner-eyebrow
                        className={`flex items-center gap-2.5 mb-3 sm:mb-4 invisible ${theme.text}`}
                      >
                        <Globe2 className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.25em]">
                          From China to Worldwide
                        </span>
                        <span className={`w-8 sm:w-12 h-px shrink-0 ${theme.divider}`} />
                        <Plane className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 -rotate-12" />
                      </div>
                      <h2
                        className={`font-fraunces text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] mb-2 sm:mb-3 whitespace-nowrap ${theme.text}`}
                      >
                        <GradualSpacing ref={(el) => (titleRefs.current[i] = el)} text={panel.title} />
                      </h2>
                      <p
                        data-banner-subtitle
                        className={`text-sm sm:text-base md:text-lg font-semibold max-w-md ${theme.text}`}
                      >
                        {panel.subtitle}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
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
