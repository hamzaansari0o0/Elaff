'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { ArrowRight, Globe2, Plane } from 'lucide-react';
import InquiryDrawer from './InquiryDrawer';
import { CATEGORY_THEME, DEFAULT_THEME } from './bannerTheme';

import 'swiper/css';

const AUTOPLAY_DELAY = 5000;
const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Mobile-only banner. The desktop/tablet full-screen scroll-pinned sequence
// (BannerPanels) forces every image into a tall, narrow box, which either
// crops it or letterboxes it — neither reads well on a phone. A shorter,
// fixed-height autoplaying carousel lets each image sit at a size it actually
// fits, while still cycling through all of them automatically.
export default function MobileBannerCarousel({ images = [], collections = [] }) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const ringRef = useRef(null);
  const secondsRef = useRef(null);

  // Fires every animation frame while autoplay counts down — mutating the ring
  // and label directly (instead of via setState) avoids re-rendering the whole
  // carousel dozens of times a second.
  function handleAutoplayTimeLeft(swiper, timeLeft, progress) {
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - progress));
    }
    if (secondsRef.current) {
      secondsRef.current.textContent = String(Math.max(1, Math.ceil(timeLeft / 1000)));
    }
  }

  if (images.length === 0) return null;

  return (
    <>
      <section className="relative w-full h-[50svh] overflow-hidden bg-[#05070c]">
        <Swiper
          modules={[Autoplay]}
          loop
          slidesPerView={1}
          autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
          onAutoplayTimeLeft={handleAutoplayTimeLeft}
          className="h-full w-full"
        >
          {images.map((panel, i) => {
            const theme = CATEGORY_THEME[panel.theme] || DEFAULT_THEME;
            return (
              <SwiperSlide key={panel.src + i} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={panel.src} alt={panel.alt || ''} className="w-full h-full object-[inherit]" />

                {(panel.title || panel.subtitle) && (
                  <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-5 pointer-events-none">
                    <div className={`flex items-center gap-1.5 mb-1.5 ${theme.text}`}>
                      <Globe2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[9px] font-extrabold uppercase tracking-[0.2em]">
                        From China to Worldwide
                      </span>
                      <span className={`w-5 h-px shrink-0 ${theme.divider}`} />
                      <Plane className="w-3 h-3 shrink-0 -rotate-12" />
                    </div>
                    <h2
                      className={`font-fraunces text-xl min-[400px]:text-2xl font-black leading-tight mb-1 whitespace-nowrap ${theme.text}`}
                    >
                      {panel.title}
                    </h2>
                    <p className={`text-xs min-[400px]:text-sm font-semibold max-w-[80%] ${theme.text}`}>
                      {panel.subtitle}
                    </p>
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Autoplay countdown — ring drains over the 5s delay, refilling the
            instant the slide changes. */}
        <div className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm grid place-items-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="18" cy="18" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
            <circle
              ref={ringRef}
              cx="18"
              cy="18"
              r={RING_RADIUS}
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={0}
              strokeLinecap="round"
            />
          </svg>
          <span ref={secondsRef} className="relative text-[11px] font-bold text-white">
            {AUTOPLAY_DELAY / 1000}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-6 z-10 flex flex-wrap items-center justify-center gap-y-2.5 gap-x-3 px-4">
          <button
            onClick={() => setIsInquiryOpen(true)}
            className="group inline-flex items-center gap-2 rounded-full bg-brand-cta hover:bg-brand-cta-hover px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-[0_0_30px_-8px_rgba(13,148,136,0.7)] transition-[background-color,box-shadow]"
          >
            Send Inquiry
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/30 px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white"
          >
            Explore Full Catalog
          </Link>
        </div>
      </section>

      <InquiryDrawer isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} categories={collections} />
    </>
  );
}
