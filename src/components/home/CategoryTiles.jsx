import Link from 'next/link';
import {
  Apple,
  Baby,
  Candy,
  Carrot,
  Coffee,
  CupSoda,
  Droplets,
  Drumstick,
  Fish,
  ShoppingBasket,
  Snowflake,
  SprayCan,
  Sprout,
  UtensilsCrossed,
  Wheat,
  Zap,
} from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import HomeCarousel from './HomeCarousel';
import FadeUp from './FadeUp';

// lib/homeCategories.js picks an icon by name; this maps each name to the real icon.
const ICONS = { Apple, Baby, Candy, Carrot, Coffee, CupSoda, Droplets, Drumstick, Fish, ShoppingBasket, Snowflake, SprayCan, Sprout, UtensilsCrossed, Wheat, Zap };

// "Browse our categories": one coloured tile per collection that has products, most
// stocked first. `categories` comes from pickHomeCategories().
export default function CategoryTiles({ categories }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <SectionHeader title="Browse Our Categories" link="/shop" />

      <FadeUp>
        <HomeCarousel label="Browse our categories" trackClassName="gap-x-3 sm:gap-x-5" arrowTop="36%">
          {categories.map((category) => {
            const Icon = ICONS[category.icon] ?? ShoppingBasket;
            return (
              <li key={category.slug} className="w-[92px] flex-none snap-start sm:w-[116px]">
                <Link href={`/shop?collection=${category.slug}`} title={category.title} className="group flex flex-col items-center gap-2 text-center">
                  <span
                    className="flex h-[84px] w-[84px] items-center justify-center rounded-2xl text-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg sm:h-[104px] sm:w-[104px]"
                    style={{ backgroundColor: category.color }}
                  >
                    <Icon className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.4} aria-hidden="true" />
                  </span>
                  <span className="line-clamp-3 text-xs font-semibold leading-tight text-gray-900 sm:text-[13px]">{category.title}</span>
                </Link>
              </li>
            );
          })}
        </HomeCarousel>
      </FadeUp>
    </section>
  );
}
