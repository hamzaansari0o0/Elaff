import Link from 'next/link';
import {
  getAllProducts,
  getProductsByTag,
  getProductsByCollection,
  searchProducts,
  getCategoryCards,
  toCardShape,
} from '@/lib/products';
import ProductCard from '@/components/ui/ProductCard';

const TAG_LABELS = {
  onSale: 'Latest On Sale',
  weeklyFeatured: 'Weekly Featured Products',
  bestseller: 'Our Bestsellers',
};

export default async function ShopPage({ searchParams }) {
  const { tag, search, collection } = await searchParams;

  const categoryCards = await getCategoryCards();
  const activeCategory = categoryCards.find((c) => c.slug === collection);

  let products;
  let title;
  if (search) {
    products = await searchProducts(search);
    title = `Search Results for "${search}"`;
  } else if (collection) {
    products = activeCategory ? await getProductsByCollection(collection) : [];
    title = activeCategory ? activeCategory.title : 'Products';
  } else if (tag) {
    products = await getProductsByTag(tag);
    title = TAG_LABELS[tag] || 'Products';
  } else {
    products = await getAllProducts();
    title = 'All Products';
  }

  const cards = products.map(toCardShape);
  const isAllProducts = !collection && !tag && !search;

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 mb-8 shadow-sm">
          <span className="text-brand-cyan text-xs font-extrabold uppercase tracking-widest">Shop</span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase mt-1 wrap-break-word">{title}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar: Product Groups */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-4 lg:sticky lg:top-24">
              <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-3 px-2">
                Product Groups
              </h2>
              <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                <Link
                  href="/shop"
                  className={`shrink-0 flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                    isAllProducts
                      ? 'bg-brand-navy text-white'
                      : 'text-gray-600 hover:bg-slate-50 hover:text-brand-navy'
                  }`}
                >
                  All Products
                </Link>
                {categoryCards.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/shop?collection=${cat.slug}`}
                    className={`shrink-0 flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap ${
                      collection === cat.slug
                        ? 'bg-brand-navy text-white'
                        : 'text-gray-600 hover:bg-slate-50 hover:text-brand-navy'
                    }`}
                  >
                    <span>{cat.title}</span>
                    <span className={collection === cat.slug ? 'text-white/70' : 'text-gray-400'}>
                      {cat.count.replace(' PRODUCTS', '')}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            {cards.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
                No products found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {cards.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
