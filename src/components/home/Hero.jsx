'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Globe2, Truck, Sparkles, PackageCheck, ArrowRight, ChevronDown } from 'lucide-react';
import InquiryDrawer from './InquiryDrawer';

gsap.registerPlugin(ScrollTrigger);

const HEADLINE_WORDS = ['Wholesale', 'Excellence,', 'Delivered', 'To', 'Every', 'Border.'];

function buildTrustBadges(companySettings) {
  const exportCount = companySettings?.exportMarkets?.length || 0;

  return [
    {
      icon: ShieldCheck,
      label: companySettings?.verified ? companySettings.verifiedLabel || 'Verified Supplier' : 'Verified Supplier',
    },
    {
      icon: Globe2,
      label: exportCount > 0 ? `Exporting to ${exportCount}+ Markets` : 'Global Export Network',
    },
    {
      icon: Truck,
      label: companySettings?.onTimeDelivery ? `${companySettings.onTimeDelivery} On-Time Delivery` : 'Reliable Bulk Delivery',
    },
    {
      icon: Sparkles,
      label: companySettings?.responseTime ? `${companySettings.responseTime} Response Time` : 'Fast Quote Turnaround',
    },
  ];
}

export default function Hero({ collections = [], companySettings = null, showcaseProduct = null }) {
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const scrollCueRef = useRef(null);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  const badges = buildTrustBadges(companySettings);
  const exportCount = companySettings?.exportMarkets?.length || 0;
  const marketsLabel = exportCount > 0 ? `${exportCount}+` : 'dozens of';

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Product card animates in alongside the text column (its own timing, starting
      // near t=0) rather than waiting for the text sequence to finish, so the primary
      // CTA below settles in well under a second instead of trailing a long queue.
      tl.from(cardRef.current, { y: 30, opacity: 0, scale: 0.95, duration: 0.8 }, 0.1)
        .from('[data-hero-float]', { y: 18, opacity: 0, duration: 0.5, stagger: 0.1 }, 0.4)
        .from('[data-hero-badge]', { y: -14, opacity: 0, duration: 0.45, stagger: 0.05 }, 0)
        .from('[data-hero-eyebrow]', { y: 12, opacity: 0, duration: 0.4 }, '-=0.2')
        .from('[data-hero-word]', { yPercent: 130, opacity: 0, duration: 0.6, stagger: 0.04 }, '-=0.15')
        .from('[data-hero-sub]', { y: 16, opacity: 0, duration: 0.45 }, '-=0.3')
        .from('[data-hero-cta]', { y: 14, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.25')
        .from('[data-hero-chip]', { y: 10, opacity: 0, duration: 0.35, stagger: 0.03 }, '-=0.2')
        .from(scrollCueRef.current, { opacity: 0, duration: 0.4 }, '-=0.1');

      // Gentle idle float on the showcase card — separate transform properties from
      // the pointer-tilt tween below, so GSAP can run both simultaneously.
      gsap.to(cardRef.current, { y: -10, duration: 2.6, ease: 'sine.inOut', repeat: -1, yoyo: true });

      // Slow ambient glow drift, purely decorative.
      gsap.utils.toArray('[data-hero-glow]').forEach((el, i) => {
        gsap.to(el, {
          x: i % 2 === 0 ? 30 : -30,
          y: i % 2 === 0 ? -20 : 20,
          duration: 9 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });

      // Scroll indicator fades as the visitor starts scrolling; glow layer drifts
      // slightly for a subtle parallax exit from the hero.
      gsap.to(scrollCueRef.current, {
        opacity: 0,
        y: 10,
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: '+=260', scrub: true },
      });

      gsap.to('[data-hero-parallax]', {
        yPercent: -14,
        scrollTrigger: { trigger: rootRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { scope: rootRef }
  );

  function handlePointerMove(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateY: px * 10,
      rotateX: py * -10,
      duration: 0.6,
      ease: 'power2.out',
      transformPerspective: 800,
    });
  }

  function handlePointerLeave() {
    gsap.to(cardRef.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
  }

  return (
    <>
      <section
        ref={rootRef}
        className="relative w-full min-h-[94svh] overflow-hidden bg-[#05070c] text-white [perspective:1200px]"
      >
        {/* Ambient glow */}
        <div data-hero-parallax className="absolute inset-0 pointer-events-none">
          <div data-hero-glow className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-brand-cta/25 blur-[130px]" />
          <div data-hero-glow className="absolute top-1/3 -right-24 w-[420px] h-[420px] rounded-full bg-brand-amber/20 blur-[130px]" />
          <div data-hero-glow className="absolute bottom-0 left-1/3 w-[360px] h-[360px] rounded-full bg-brand-cta/10 blur-[120px]" />
        </div>

        {/* Faint dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-16 pb-12 sm:pt-20 md:pt-24 min-h-[94svh] flex flex-col justify-center">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-10 items-center">
            {/* Left column */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {badges.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    data-hero-badge
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-sm px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-wider text-white/70"
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-cta shrink-0" />
                    {label}
                  </span>
                ))}
              </div>

              <p
                data-hero-eyebrow
                className="font-bricolage text-xs md:text-sm font-extrabold uppercase tracking-[0.25em] text-brand-cta mb-4"
              >
                {companySettings?.companyName || 'Elaff Trade Co.'} — Global Wholesale Partner
              </p>

              <h1 className="font-fraunces text-[2.2rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-6xl 2xl:text-7xl font-black tracking-tight mb-5">
                {HEADLINE_WORDS.map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden pb-1 mr-[0.28em] align-bottom">
                    <span data-hero-word className="inline-block">
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              <p data-hero-sub className="font-bricolage text-sm sm:text-base text-white/60 max-w-lg mb-7 leading-relaxed">
                From frozen foods to fine beverages, confectionery to raw agricultural stock — we source, pack, and
                export premium consumer goods at scale, backed by verified quality and a logistics network spanning{' '}
                {marketsLabel} international markets.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button
                  data-hero-cta
                  onClick={() => setIsInquiryOpen(true)}
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-cta hover:bg-brand-cta-hover px-7 py-3.5 text-xs md:text-sm font-extrabold uppercase tracking-widest text-white shadow-[0_0_40px_-10px_rgba(13,148,136,0.7)] transition-[background-color,box-shadow] hover:-translate-y-0.5"
                >
                  Send Inquiry
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <Link
                  data-hero-cta
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.06] px-7 py-3.5 text-xs md:text-sm font-extrabold uppercase tracking-widest text-white/80 hover:text-white transition-colors"
                >
                  Explore Full Catalog
                </Link>
              </div>

              {collections.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {collections.slice(0, 6).map((c) => (
                    <Link
                      key={c.slug}
                      data-hero-chip
                      href={`/collection/${c.slug}`}
                      className="text-[11px] font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/25 rounded-full px-3.5 py-1.5 transition-colors"
                    >
                      {c.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right column — product showcase */}
            <div className="relative flex justify-center lg:justify-end">
              <div
                data-hero-float
                className="hidden sm:flex absolute -top-4 -left-4 lg:-left-8 z-20 items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md px-4 py-3 shadow-xl"
              >
                <PackageCheck className="w-5 h-5 text-brand-cta shrink-0" />
                <div>
                  <p className="text-sm font-black leading-none">{collections.length || '6'}+</p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wide mt-0.5">Categories</p>
                </div>
              </div>

              <div
                ref={cardRef}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] [transform-style:preserve-3d]"
              >
                {showcaseProduct ? (
                  <>
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={showcaseProduct.image}
                        alt={showcaseProduct.title}
                        className="w-full h-full object-cover"
                      />
                      {showcaseProduct.badge && (
                        <span className="absolute top-4 left-4 bg-brand-amber text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow">
                          {showcaseProduct.badge}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <div className="px-3 pt-4 pb-3">
                      {showcaseProduct.category && (
                        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-cta mb-1">
                          {showcaseProduct.category}
                        </p>
                      )}
                      <h3 className="font-fraunces text-lg font-bold leading-snug mb-2">{showcaseProduct.title}</h3>
                      <div className="flex items-center justify-between gap-3">
                        {showcaseProduct.price && (
                          <span className="text-sm font-black text-white">{showcaseProduct.price}</span>
                        )}
                        <Link
                          href={`/product/${showcaseProduct.slug}`}
                          className="text-[11px] font-bold text-white/60 hover:text-white inline-flex items-center gap-1 shrink-0"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="aspect-[4/5] rounded-3xl bg-white/5 flex items-center justify-center text-white/30 text-sm">
                    Featured product
                  </div>
                )}
              </div>

              <div
                data-hero-float
                className="hidden sm:flex absolute -bottom-5 -right-2 lg:-right-6 z-20 items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-md px-4 py-3 shadow-xl"
              >
                <ShieldCheck className="w-5 h-5 text-brand-cta shrink-0" />
                <div>
                  <p className="text-sm font-black leading-none">
                    {companySettings?.verified ? 'Verified' : 'Trusted'}
                  </p>
                  <p className="text-[10px] text-white/50 uppercase tracking-wide mt-0.5">Trade Assurance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollCueRef}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      <InquiryDrawer isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} categories={collections} />
    </>
  );
}
