import {
  ContainerScroll,
  ContainerSticky,
  GalleryContainer,
  GalleryCol,
} from '@/components/ui/animated-gallery';

const COLUMN_STYLES = [
  { yRange: ['-10%', '2%'], className: '-mt-2' },
  { yRange: ['15%', '5%'], className: 'mt-[-25%]' },
  { yRange: ['-10%', '2%'], className: '-mt-2' },
];

// One batch of logos (3 columns), pinned and revealed on scroll. Repeated
// down the partners page — with ~150 logos, one continuous grid would either
// be microscopic or force a giant page load at once. Only the first batch
// gets the dramatic 3D tilt-in (`tilt`); doing that same flip for every
// batch reads as repetitive rather than dynamic, so the rest keep only the
// subtler scale-in and column drift.
export default function PartnerLogoGroup({ logos, tilt = false }) {
  const columns = [[], [], []];
  logos.forEach((logo, i) => columns[i % 3].push(logo));

  return (
    <ContainerScroll className="relative h-[180vh]">
      <ContainerSticky className="h-svh flex items-center">
        <GalleryContainer tilt={tilt} className="max-w-5xl mx-auto px-6">
          {columns.map((col, i) => (
            <GalleryCol key={i} yRange={COLUMN_STYLES[i].yRange} className={COLUMN_STYLES[i].className}>
              {col.map((logo) => (
                <div
                  key={logo.src}
                  className="flex aspect-[3/2] items-center justify-center rounded-md border border-gray-200 bg-white p-4 shadow"
                >
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
              ))}
            </GalleryCol>
          ))}
        </GalleryContainer>
      </ContainerSticky>
    </ContainerScroll>
  );
}
