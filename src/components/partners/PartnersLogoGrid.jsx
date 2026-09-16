'use client';

import { motion } from 'framer-motion';

// Rises into place from below as it nears the viewport — the `-50px` bottom
// margin fires the reveal while the tile is still ~50px below the visible
// area, so the scale/opacity settle finishes right as it crosses into view
// instead of animating a tile that's already fully visible.
function LogoTile({ logo, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56, scale: 0.8 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      transition={{ duration: 0.55, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group flex aspect-[3/2] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-110"
      />
    </motion.div>
  );
}

export default function PartnersLogoGrid({ logos }) {
  return (
    <section className="bg-brand-slate px-6 py-16 md:py-24">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <span className="mb-3 inline-block text-[11px] font-bold text-brand-cta uppercase tracking-widest">
          Global Brands
        </span>
        <h2 className="font-fraunces text-3xl md:text-5xl font-black text-gray-900 leading-tight">
          One Trading Partner,
          <br />
          Every Brand You Trust.
        </h2>
        <p className="mt-4 font-bricolage text-sm md:text-base text-gray-600 leading-relaxed">
          We work directly with FMCG brands across grocery, personal care, confectionery, and
          beverages — sourcing, distributing, and delivering their products to businesses
          worldwide.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {logos.map((logo, index) => (
          <LogoTile key={logo.src} logo={logo} index={index} />
        ))}
      </div>
    </section>
  );
}
