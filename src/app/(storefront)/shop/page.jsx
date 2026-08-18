import { getAllProducts, getProductsByTag, searchProducts, toCardShape } from '@/lib/products';
import ProductCard from '@/components/ui/ProductCard';

const TAG_LABELS = {
  onSale: 'Latest On Sale',
  weeklyFeatured: 'Weekly Featured Products',
  bestseller: 'Our Bestsellers',
};

export default async function ShopPage({ searchParams }) {
  const { tag, search } = await searchParams;

  let products;
  let title;
  if (search) {
    products = await searchProducts(search);
    title = `Search Results for "${search}"`;
  } else if (tag) {
    products = await getProductsByTag(tag);
    title = TAG_LABELS[tag] || 'Products';
  } else {
    products = await getAllProducts();
    title = 'All Products';
  }

  const cards = products.map(toCardShape);

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 mb-8 shadow-sm">
          <span className="text-brand-cyan text-xs font-extrabold uppercase tracking-widest">Shop</span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase mt-1 wrap-break-word">{title}</h1>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {cards.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
