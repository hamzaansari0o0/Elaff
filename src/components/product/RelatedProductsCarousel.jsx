'use client';

import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';

export default function RelatedProductsCarousel({ products }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  if (!products?.length) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        grabCursor={true}
        spaceBetween={16}
        slidesPerView={1.15}
        breakpoints={{
          480: { slidesPerView: 1.6, spaceBetween: 16 },
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          1024: { slidesPerView: 3.2, spaceBetween: 24 },
          1280: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="pb-2!"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        ref={prevRef}
        aria-label="Previous products"
        className="hidden md:flex absolute top-1/2 -left-4 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:text-brand-navy hover:border-brand-navy transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        ref={nextRef}
        aria-label="Next products"
        className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-9 h-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md text-gray-600 hover:text-brand-navy hover:border-brand-navy transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
