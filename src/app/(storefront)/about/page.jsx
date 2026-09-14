import AboutHero from '@/components/about/AboutHero';
import CompanyProfile from '@/components/about/CompanyProfile';
import OurService from '@/components/about/OurService';
import OurProcess from '@/components/about/OurProcess';
import StackSpread from '@/components/ui/stack-spread';
import { buildCards } from '@/components/ui/stack-spread-cards';
import { getAllProducts } from '@/lib/products';
import { pickDiverseProductImages } from '@/lib/aboutImages';

export const metadata = {
  title: 'About Us | Elaff Trade Co.',
  description:
    'Elaff Trade Co. is a B2B trading company sourcing and exporting grocery, agricultural, frozen, and confectionery products worldwide.',
};

// Without this, Next.js statically renders the page once at build time and
// newly added product photos never show up in the hero/spread until redeploy.
export const revalidate = 60;

// Guarantees a full, real set of images regardless of catalog size — real
// product photos are preferred, with these as filler if there aren't enough yet.
const CATEGORY_FALLBACKS = [
  { src: '/home%20banner%20image/grocery%20products.jpeg', alt: 'Grocery products' },
  { src: '/home%20banner%20image/agricultural%20products.jpeg', alt: 'Agricultural products' },
  { src: '/home%20banner%20image/frozen%20items.jpeg', alt: 'Frozen items' },
  { src: '/home%20banner%20image/confectioneries.jpeg', alt: 'Confectioneries' },
];

export default async function AboutPage() {
  const products = await getAllProducts();
  // A larger pool, split into two non-overlapping halves, so the hero
  // corridor and the "Quality Trusted Worldwide" spread never show the same
  // photos.
  const diverseImages = pickDiverseProductImages(products, 20);
  const [heroPool, spreadPool] = [diverseImages.slice(0, 12), diverseImages.slice(12, 20)];

  const heroImages = heroPool.length > 0 ? heroPool : CATEGORY_FALLBACKS;
  const cards = buildCards([...spreadPool, ...CATEGORY_FALLBACKS].slice(0, 8));

  return (
    <main className="bg-slate-50">
      <AboutHero images={heroImages} />

      <CompanyProfile />

      <OurService />

      <OurProcess />

      <StackSpread
        cards={cards}
        headingTop="Quality"
        headingMuted="Trusted"
        headingEmphasis="Worldwide."
        subtitle="Every shipment is sourced, packed, and delivered on schedule — for wholesalers, distributors, and international brands around the world."
      />
    </main>
  );
}
