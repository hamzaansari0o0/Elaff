'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import InquiryDrawer from './InquiryDrawer';

import 'swiper/css';

// Mobile-only banner. The desktop/tablet full-screen scroll-pinned sequence
// (BannerPanels) forces every image into a tall, narrow box, which either
// crops it or letterboxes it — neither reads well on a phone. A shorter,
// fixed-height autoplaying carousel lets each image sit at a size it actually
// fits, while still cycling through all of them automatically.
export default function MobileBannerCarousel({ images = [], collections = [] }) {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  if (images.length === 0) return null;

  return (
    <>
      <section className="relative w-full h-[50svh] overflow-hidden bg-[#05070c]">
        <Swiper
          modules={[Autoplay]}
          loop
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          className="h-full w-full"
        >
          {images.map((panel, i) => (
            <SwiperSlide key={panel.src + i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={panel.src} alt={panel.alt || ''} className="w-full h-full object-[inherit]" />
            </SwiperSlide>
          ))}
        </Swiper>

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
