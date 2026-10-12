import { getShopProducts, getCategoryCards, getCollectionBySlug, toCardShape } from '@/lib/products';
import ShopSidebar from '@/components/shop/ShopSidebar';
import ShopResults from '@/components/shop/ShopResults';
import { pageMetadata, shopIndexing } from '@/lib/seo';

const TAG_LABELS = {
  onSale: 'Latest On Sale',
  weeklyFeatured: 'Weekly Featured Products',
  bestseller: 'Our Bestsellers',
};

// Refreshes the cached shop listing at most once a minute. searchParams usage
// below already forces this route to render dynamically per request, so this
// mainly documents intent — it doesn't change behavior on its own.
export const revalidate = 60;

async function deriveShopTitle({ tag, search, collection }) {
  if (search) return `Search Results for "${search}"`;
  if (collection) {
    const collectionDoc = await getCollectionBySlug(collection);
    return collectionDoc ? collectionDoc.title : 'Products';
  }
  if (tag) return TAG_LABELS[tag] || 'Products';
  return 'All Products';
}

export async function generateMetadata({ searchParams }) {
  const { tag, search, collection, sort, page } = await searchParams;
  const title = await deriveShopTitle({ tag, search, collection });

  // getCollectionBySlug is cached per request, so this reuses the lookup deriveShopTitle just made.
  // Search results are never indexed (and the page itself doesn't look the collection up for a
  // search), so the lookup is skipped there.
  const collectionFound = !search && collection ? Boolean(await getCollectionBySlug(collection)) : false;
  const { path, noindex } = shopIndexing({ search, collection, collectionFound, tag, sort, page });

  return pageMetadata({
    title,
    description: 'Browse wholesale grocery, agricultural, frozen, and confectionery products from Elaff Trade Co.',
    path,
    noindex,
  });
}

export default async function ShopPage({ searchParams }) {
  const { tag, search, collection, page, sort } = await searchParams;

  const [categoryCards, shopResult, title] = await Promise.all([
    getCategoryCards(),
    getShopProducts({ tag, collectionSlug: collection, search, page, sort }),
    deriveShopTitle({ tag, search, collection }),
  ]);

  const cards = shopResult.products.map(toCardShape);
  const isAllProducts = !collection && !tag && !search;

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      {/* Banner — shown at full brightness with no overlay. The heading is
          kept for screen readers/SEO but isn't visible. */}
      <h1 className="sr-only">{title}</h1>
      <div className="w-full h-56 sm:h-72 md:h-96 3xl:h-[32rem] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shop-banner.jpg" alt="" fetchPriority="high" decoding="async" className="w-full h-full object-[inherit] block" />
      </div>

      <div className="max-w-7xl 3xl:max-w-[1800px] mx-auto px-4 md:px-8 py-8 md:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <ShopSidebar categoryCards={categoryCards} activeSlug={collection} isAllProducts={isAllProducts} />
          <ShopResults cards={cards} total={shopResult.total} page={shopResult.page} totalPages={shopResult.totalPages} />
        </div>
      </div>
    </main>
  );
}
