import Link from 'next/link';
import { CATEGORY_CARDS } from '@/data/mockData';

export default function CategoryCards() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Mobile par 2 columns, tablet par 3, desktop par 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {CATEGORY_CARDS.map((cat, idx) => (
          <Link
            key={idx}
            href={`/collection/${cat.slug}`}
            className="group bg-white border border-gray-100 rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 text-center p-4 md:p-6 cursor-pointer block"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4 rounded-full overflow-hidden bg-slate-50 p-2 border border-gray-100 group-hover:scale-105 transition-transform duration-300">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-fraunces text-[11px] md:text-xs font-extrabold text-gray-800 uppercase tracking-wider mb-1 group-hover:text-[#6B0018] transition-colors">
              {cat.title}
            </h3>
            <span className="font-bricolage text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {cat.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}