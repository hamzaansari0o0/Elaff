'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';
import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/components/ui/ProductCard';

import 'swiper/css';
import 'swiper/css/free-mode';

export default function ProductSection({ title, products, link }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <SectionHeader title={title} link={link} />

      {/* Horizontal swipe on mobile/tablet, settles into a full row on desktop */}
      <Swiper
        modules={[FreeMode]}
        freeMode={true}
        grabCursor={true}
        spaceBetween={16}
        slidesPerView={1.15}
        breakpoints={{
          480: { slidesPerView: 1.6, spaceBetween: 16 },
          640: { slidesPerView: 2.2, spaceBetween: 20 },
          1024: { slidesPerView: 3.2, spaceBetween: 24 },
          1280: { slidesPerView: 4, spaceBetween: 24 },
        }}
        className="mt-4! md:mt-6! pb-2!"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
