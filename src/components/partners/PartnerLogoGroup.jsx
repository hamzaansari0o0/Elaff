'use client';

import { useEffect, useState } from 'react';
import {
  ContainerAnimated,
  ContainerScroll,
  ContainerStagger,
  ContainerSticky,
  GalleryContainer,
  GalleryCol,
} from '@/components/ui/animated-gallery';

const COLUMN_STYLES = [
  { yRange: ['-10%', '2%'], className: '-mt-2' },
  { yRange: ['15%', '5%'], className: 'mt-[-25%]' },
  { yRange: ['-10%', '2%'], className: '-mt-2' },
];

function LogoCard({ logo, className = '' }) {
  return (
    <div className={`flex aspect-[3/2] items-center justify-center rounded-md border border-gray-200 bg-white p-3 shadow sm:p-4 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logo.src}
        alt={logo.alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

// `animated-gallery.jsx`'s 3-column layout (side-by-side parallax columns
// under a pinned, 3D-tilted scroll reveal) is a fixed `grid-cols-3` with no
// responsive fallback — on anything under ~1024px that squeezes 12 logos
// into three painfully narrow strips. Below that width this renders a plain
// stacked grid instead, in normal document flow (no scroll-pin, no 3D tilt),
// since a touch-driven narrow viewport doesn't have the room — or the
// pointer input — for that effect to read as anything but broken.
function useIsCompact() {
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const read = () => setIsCompact(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);
  return isCompact;
}

export default function PartnerLogoGroup({ logos, tilt = false }) {
  const isCompact = useIsCompact();

  if (isCompact) {
    return (
      <ContainerStagger className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-6 py-10 max-w-2xl mx-auto">
        {logos.map((logo) => (
          <ContainerAnimated key={logo.src}>
            <LogoCard logo={logo} />
          </ContainerAnimated>
        ))}
      </ContainerStagger>
    );
  }

  const columns = [[], [], []];
  logos.forEach((logo, i) => columns[i % 3].push(logo));

  return (
    <ContainerScroll className="relative h-[180vh]">
      <ContainerSticky className="h-svh flex items-center">
        <GalleryContainer tilt={tilt} className="max-w-5xl mx-auto px-6">
          {columns.map((col, i) => (
            <GalleryCol key={i} yRange={COLUMN_STYLES[i].yRange} className={COLUMN_STYLES[i].className}>
              {col.map((logo) => (
                <LogoCard key={logo.src} logo={logo} />
              ))}
            </GalleryCol>
          ))}
        </GalleryContainer>
      </ContainerSticky>
    </ContainerScroll>
  );
}
