// src/app/collection/[slug]/page.jsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCollectionBySlug, getProductsByCollection } from '@/lib/products';

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = await getProductsByCollection(slug);

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Collection Banner */}
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 mb-8 shadow-sm">
          <span className="text-brand-cyan text-xs font-extrabold uppercase tracking-widest">Collection</span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase mt-1 mb-3">
            {collection.title}
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl">{collection.description}</p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link 
              key={product.id} 
              href={`/product/${product.slug}`}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img 
                    src={product.images[0]} 
                    alt={product.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <span className="text-[10px] font-extrabold text-brand-amber uppercase tracking-wider">
                    {product.sku}
                  </span>
                  <h3 className="text-lg font-extrabold text-gray-900 uppercase mt-1 mb-2">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {product.shortDescription}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <span className="inline-block w-full text-center bg-slate-100 hover:bg-brand-cta hover:text-white text-gray-800 text-xs font-bold py-2.5 rounded-lg transition-colors uppercase tracking-wider">
                  View Details & Inquire
                </span>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            No products found in this collection.
          </div>
        )}
      </div>
    </div>
  );
}