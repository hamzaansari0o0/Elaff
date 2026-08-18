import Link from 'next/link';
import { getCategoryCards } from '@/lib/products';

export const revalidate = 60;

export default async function CollectionsPage() {
  const collections = await getCategoryCards();

  return (
    <div className="bg-slate-50 min-h-screen py-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl p-6 md:p-10 border border-gray-200 mb-8 shadow-sm">
          <span className="text-brand-cyan text-xs font-extrabold uppercase tracking-widest">Browse</span>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 uppercase mt-1">All Collections</h1>
        </div>

        {collections.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            No collections found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((c) => (
              <Link
                key={c.slug}
                href={`/collection/${c.slug}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-[16/9] bg-gray-100 overflow-hidden">
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-extrabold text-gray-900 uppercase mb-1 group-hover:text-brand-navy transition-colors">
                    {c.title}
                  </h3>
                  <span className="text-[10px] font-extrabold text-brand-amber uppercase tracking-wider">
                    {c.count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
