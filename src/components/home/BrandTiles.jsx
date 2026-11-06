import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import HomeCarousel from './HomeCarousel';
import FadeUp from './FadeUp';

// "Discover our brands": a grey tile per brand the catalogue carries, each linking to
// that brand's products. `brands` comes from getHomeBrands().
//
// Logos are a mix of transparent PNGs and JPEGs on a white background; multiply blending
// makes the white vanish into the grey tile so every logo sits on it cleanly.
export default function BrandTiles({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <SectionHeader title="Discover Our Brands" link="/partners" />

      <FadeUp>
        <HomeCarousel label="Discover our brands" trackClassName="gap-x-3 sm:gap-x-5" arrowTop="50%">
          {brands.map((brand) => (
            <li key={brand.name} className="flex-none snap-start">
              <Link
                href={brand.href}
                title={`${brand.name} products`}
                className="flex h-[84px] w-[84px] items-center justify-center rounded-2xl bg-gray-100 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-[104px] sm:w-[104px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  loading="lazy"
                  decoding="async"
                  className="max-h-[56%] max-w-[76%] object-contain mix-blend-multiply"
                />
              </Link>
            </li>
          ))}
        </HomeCarousel>
      </FadeUp>
    </section>
  );
}
