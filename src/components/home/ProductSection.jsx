import SectionHeader from '@/components/ui/SectionHeader';
import HomeCarousel from './HomeCarousel';
import FadeUp from './FadeUp';
import OfferCard from './OfferCard';

// How many cards fit across at each screen width — 2 (plus a peek of the third, to show
// it scrolls) on phones, then 3, 4, 5 and 6. Each width is the row's width minus the
// gaps (1rem each) divided by the card count, so a row always ends exactly at its edge.
const CARD =
  'flex-none snap-start w-[calc((100%_-_1rem)/2.15)] sm:w-[calc((100%_-_2rem)/3)] md:w-[calc((100%_-_3rem)/4)] lg:w-[calc((100%_-_4rem)/5)] xl:w-[calc((100%_-_5rem)/6)]';

export default function ProductSection({ title, products, link }) {
  // Nothing tagged for this section in the admin yet — skip the section entirely
  // instead of showing an empty header with no products under it.
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <SectionHeader title={title} link={link} />

      <FadeUp>
        {/* The arrows sit level with the middle of the photo, not the whole card. */}
        <HomeCarousel label={title} arrowTop="30%">
          {products.map((product) => (
            <li key={product.id} className={CARD}>
              <OfferCard product={product} />
            </li>
          ))}
        </HomeCarousel>
      </FadeUp>
    </section>
  );
}
