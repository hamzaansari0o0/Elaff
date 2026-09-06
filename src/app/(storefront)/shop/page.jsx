import { getShopProducts, getCategoryCards, toCardShape } from '@/lib/products';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ShopResults from '@/components/shop/ShopResults';

const TAG_LABELS = {
  onSale: 'Latest On Sale',
  weeklyFeatured: 'Weekly Featured Products',
  bestseller: 'Our Bestsellers',
};

export default async function ShopPage({ searchParams }) {
  const { tag, search, collection, page, sort } = await searchParams;

  const [categoryCards, shopResult] = await Promise.all([
    getCategoryCards(),
    getShopProducts({ tag, collectionSlug: collection, search, page, sort }),
  ]);

  let title;
  if (search) {
    title = `Search Results for "${search}"`;
  } else if (collection) {
    title = shopResult.collection ? shopResult.collection.title : 'Products';
  } else if (tag) {
    title = TAG_LABELS[tag] || 'Products';
  } else {
    title = 'All Products';
  }

  const cards = shopResult.products.map(toCardShape);
  const isAllProducts = !collection && !tag && !search;

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Banner — the image only, shown at full brightness and its own natural
          proportions (no crop, no overlay). The heading is kept for screen
          readers/SEO but isn't visible. */}
      <h1 className="sr-only">{title}</h1>
      <div className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shop-banner.png" alt="" className="w-full h-auto block" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <ShopSidebar categoryCards={categoryCards} activeSlug={collection} isAllProducts={isAllProducts} />
          <ShopResults cards={cards} total={shopResult.total} page={shopResult.page} totalPages={shopResult.totalPages} />
        </div>
      </div>
    </div>
  );
}
