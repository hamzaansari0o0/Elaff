import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// The closing call to action of an article: turns a reader into an inquiry.
// `collections` is a list of { title, slug } the article relates to.
export default function ArticleCta({ collections = [] }) {
  return (
    <section className="bg-brand-navy text-white rounded-2xl p-6 md:p-10">
      <h2 className="font-fraunces text-xl md:text-2xl font-black">Ready to ask for a quote?</h2>
      <p className="mt-3 text-sm md:text-base text-gray-200 leading-relaxed max-w-2xl">
        Tell us the product, the quantity and where it should be delivered, and our team will get back to you.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-hover text-white text-xs font-extrabold uppercase tracking-wider px-6 py-3 rounded-lg transition-colors"
        >
          Send an inquiry
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 border border-white/30 hover:bg-white/10 text-white text-xs font-extrabold uppercase tracking-wider px-6 py-3 rounded-lg transition-colors"
        >
          Browse the catalog
        </Link>
      </div>

      {collections.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/15">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-300 mb-3">Related collections</p>
          <ul className="flex flex-wrap gap-2">
            {collections.map(({ title, slug }) => (
              <li key={slug}>
                <Link
                  href={`/collection/${slug}`}
                  className="inline-block text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-full px-4 py-2 transition-colors"
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
