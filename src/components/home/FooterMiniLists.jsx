import Link from 'next/link';
import { getMiniCategoryLists } from '@/lib/products';

export default async function FooterMiniLists() {
  const panels = await getMiniCategoryLists();

  // No collection has any active products yet — skip the section instead of
  // showing empty category panels.
  if (panels.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-10 md:py-14 border-t border-gray-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
        {panels.map((panel) => (
          <div key={panel.slug}>
            <h3 className="font-fraunces text-sm font-black text-gray-800 uppercase tracking-wider mb-2">
              {panel.title}
            </h3>
            <span className="block w-6 h-0.5 bg-brand-cta mb-5"></span>

            <div className="divide-y divide-gray-100">
              {panel.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/product/${item.slug}`}
                  className="group flex items-center gap-4 py-3.5 first:pt-0"
                >
                  {/* Fixed square frame so every image — whatever its native aspect
                      ratio — sits fully inside with nothing cropped or overflowing. */}
                  <div className="w-16 h-16 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="font-fraunces text-sm font-bold text-gray-800 leading-snug group-hover:text-brand-navy transition-colors">
                    {item.title}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
