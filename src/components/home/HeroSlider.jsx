'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { HERO_SLIDES } from '@/data/mockData';

import 'swiper/css';
import 'swiper/css/effect-fade';

// The hero is full-bleed (100vw) so a single 1200px source would be stretched
// and blurry on wide screens — build a srcset from Unsplash's own resize params
// instead, so each viewport only downloads the width it actually renders.
const RESPONSIVE_WIDTHS = [640, 960, 1280, 1600, 1920];

const AUTOPLAY_DELAY = 5000;
const TIMER_RADIUS = 18;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

function buildResponsiveImage(url) {
  const srcSet = RESPONSIVE_WIDTHS.map((w) => {
    const variant = new URL(url);
    variant.searchParams.set('w', String(w));
    variant.searchParams.set('q', '75');
    return `${variant.toString()} ${w}w`;
  }).join(', ');

  const src = new URL(url);
  src.searchParams.set('w', '1920');
  src.searchParams.set('q', '75');

  return { src: src.toString(), srcSet };
}

export default function HeroSlider() {
  const timerRingRef = useRef(null);
  const timerCountRef = useRef(null);

  return (
    <section className="relative w-full h-[360px] sm:h-[440px] md:h-[520px] lg:h-[580px] bg-slate-900 overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        speed={800}
        autoplay={{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }}
        // Driven straight off Swiper's own autoplay clock (fires on every animation
        // frame) rather than a separate setInterval, so the ring/number can't drift
        // out of sync with the real slide change. Mutates the DOM via refs instead of
        // React state so a ~60fps callback doesn't trigger a re-render every frame.
        onAutoplayTimeLeft={(_swiper, timeLeft, percentage) => {
          const progress = 1 - percentage;
          if (timerRingRef.current) {
            timerRingRef.current.style.strokeDashoffset = String(TIMER_CIRCUMFERENCE * (1 - progress));
          }
          if (timerCountRef.current) {
            timerCountRef.current.textContent = String(Math.min(5, Math.max(1, Math.ceil(timeLeft / 1000))));
          }
        }}
        className="w-full h-full hero-swiper"
      >
        {HERO_SLIDES.map((slide, index) => {
          const { src, srcSet } = buildResponsiveImage(slide.image);
          return (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full flex items-center justify-start px-6 sm:px-10 md:px-16 lg:px-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  srcSet={srcSet}
                  sizes="100vw"
                  alt={slide.title}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent"></div>

                <div className="relative z-10 max-w-xl text-white">
                  <span className="inline-block bg-brand-amber text-white text-[10px] md:text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-3 md:mb-4 shadow-sm">
                    {slide.badge}
                  </span>
                  <h4 className="font-bricolage text-xs md:text-sm font-bold tracking-widest text-amber-400 mb-1.5 md:mb-2 uppercase">
                    {slide.subtitle}
                  </h4>
                  <h1 className="font-fraunces text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight uppercase mb-3 md:mb-4 drop-shadow-md">
                    {slide.title}
                  </h1>
                  <p className="font-bricolage text-[11px] sm:text-xs md:text-sm text-gray-300 mb-5 md:mb-6 font-medium tracking-wide max-w-sm md:max-w-md line-clamp-2 md:line-clamp-none">
                    {slide.tag}
                  </p>
                  <Link
                    href={slide.btnLink}
                    className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-hover text-white font-bold text-[11px] md:text-xs px-5 md:px-6 py-2.5 md:py-3 rounded-lg uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-lg"
                  >
                    <span>{slide.btnText}</span>
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Autoplay countdown — replaces pagination dots; fills up over the 5s delay and resets on slide change */}
      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
        <svg viewBox="0 0 44 44" className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="22" cy="22" r={TIMER_RADIUS} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
          <circle
            ref={timerRingRef}
            cx="22"
            cy="22"
            r={TIMER_RADIUS}
            fill="none"
            stroke="var(--color-brand-amber)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={TIMER_CIRCUMFERENCE}
            strokeDashoffset={TIMER_CIRCUMFERENCE}
          />
        </svg>
        <span ref={timerCountRef} className="font-bricolage text-xs md:text-sm font-bold text-white tabular-nums">
          5
        </span>
      </div>
    </section>
  );
}
