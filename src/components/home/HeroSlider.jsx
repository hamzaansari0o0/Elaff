'use client';

import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { HERO_SLIDES, SIDE_BANNERS } from '@/data/mockData';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function HeroSlider() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Dynamic Swiper Banner */}
        <div className="lg:col-span-2 rounded-xl md:rounded-2xl overflow-hidden shadow-lg relative h-[340px] sm:h-[400px] md:h-[460px] bg-slate-900">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="w-full h-full hero-swiper [&_.swiper-pagination-bullet-active]:bg-brand-amber [&_.swiper-pagination-bullet]:bg-white"
          >
            {HERO_SLIDES.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="relative w-full h-full flex items-center justify-start p-6 sm:p-10 md:p-14">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                  />
                  {/* Fully structured gradient to avoid warnings */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent"></div>

                  <div className="relative z-10 max-w-xl text-white">
                    <span className="inline-block bg-brand-amber text-white text-[10px] md:text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest mb-3 md:mb-4 shadow-sm">
                      {slide.badge}
                    </span>
                    <h4 className="font-bricolage text-xs md:text-sm font-bold tracking-widest text-amber-400 mb-1.5 md:mb-2 uppercase">
                      {slide.subtitle}
                    </h4>
                    <h1 className="font-fraunces text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight uppercase mb-3 md:mb-4 drop-shadow-md">
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
            ))}
          </Swiper>
        </div>

        {/* Side Banners (Responsive grid stack) */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 md:gap-6">
          {SIDE_BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="relative w-full flex-1 rounded-xl md:rounded-2xl overflow-hidden shadow-md group min-h-[160px] sm:min-h-[190px] lg:min-h-[218px] flex items-center p-5 md:p-6 bg-slate-900"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={banner.bgImage}
                alt={banner.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              {/* Fixed Gradient: Added 'lg:to-transparent' to clear the warning */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent lg:bg-gradient-to-r lg:from-black/90 lg:via-black/40 lg:to-transparent"></div>
              
              <div className="relative z-10 text-white w-full">
                <span className="font-bricolage text-[9px] md:text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1.5 md:mb-2">
                  {banner.tag}
                </span>
                <h3 className="font-fraunces text-sm md:text-base font-black uppercase leading-snug mb-3 md:mb-4 max-w-[200px]">
                  {banner.title}
                </h3>
                <Link
                  href={banner.link}
                  className="inline-block bg-white text-brand-navy hover:bg-brand-cta hover:text-white text-[10px] md:text-[11px] font-extrabold px-3.5 py-1.5 md:px-4 md:py-2 rounded uppercase tracking-wider transition-colors shadow"
                >
                  {banner.btnText}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}