import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import {
  getAllProducts,
  getProductsByTag,
  getProductsByCollection,
  searchProducts,
  getCategoryCards,
  toCardShape,
} from '@/lib/products';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ShopResults from '@/components/shop/ShopResults';

const TAG_LABELS = {
  onSale: 'Latest On Sale',
  weeklyFeatured: 'Weekly Featured Products',
  bestseller: 'Our Bestsellers',
};

const EYEBROWS = {
  search: 'Search',
  collection: 'Cargo Category',
  onSale: 'Current Offers',
  weeklyFeatured: 'Curated Selection',
  bestseller: 'Top Movers',
  all: 'Full Catalog',
};

export default async function ShopPage({ searchParams }) {
  const { tag, search, collection } = await searchParams;

  const categoryCards = await getCategoryCards();
  const activeCategory = categoryCards.find((c) => c.slug === collection);

  let products;
  let title;
  let eyebrow = EYEBROWS.all;
  if (search) {
    products = await searchProducts(search);
    title = `Search Results for "${search}"`;
    eyebrow = EYEBROWS.search;
  } else if (collection) {
    products = activeCategory ? await getProductsByCollection(collection) : [];
    title = activeCategory ? activeCategory.title : 'Products';
    eyebrow = EYEBROWS.collection;
  } else if (tag) {
    products = await getProductsByTag(tag);
    title = TAG_LABELS[tag] || 'Products';
    eyebrow = EYEBROWS[tag] || 'Selection';
  } else {
    products = await getAllProducts();
    title = 'All Products';
  }

  const cards = products.map(toCardShape);
  const isAllProducts = !collection && !tag && !search;

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Manifest header band */}
      <div className="relative bg-brand-navy overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-10 md:pt-12 md:pb-14">
          <nav className="flex items-center gap-1.5 text-[11px] font-bricolage font-semibold text-white/50 uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/80">Shop</span>
          </nav>

          <span className="inline-flex items-center gap-2 text-brand-cyan text-xs font-extrabold uppercase tracking-[0.2em]">
            <span className="w-6 h-px bg-brand-cyan" />
            {eyebrow}
          </span>

          <h1 className="font-fraunces text-3xl md:text-5xl font-black text-white mt-2 wrap-break-word max-w-2xl">
            {title}
          </h1>

          <p className="mt-3 text-sm text-white/60 max-w-lg font-bricolage">
            {cards.length} {cards.length === 1 ? 'item' : 'items'} available for wholesale inquiry — add what you
            need to your quote cart.
          </p>
        </div>

        {/* Perforated tear edge */}
        <div
          className="h-3 w-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 8px 6px, var(--color-brand-slate) 5px, transparent 5.5px)',
            backgroundSize: '16px 12px',
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <ShopSidebar categoryCards={categoryCards} activeSlug={collection} isAllProducts={isAllProducts} />
          <ShopResults cards={cards} />
        </div>
      </div>
    </div>
  );
}
