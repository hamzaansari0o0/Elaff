import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

// The visible breadcrumb trail. `items` is a list of { name, path } ending with
// the current page — build it with lib/breadcrumbs.js, which the structured
// data uses too. It is a real ordered list inside a labelled <nav>, which is
// what screen readers and search engines look for; the current page is marked
// with aria-current and is the only item that isn't a link.
export default function Breadcrumbs({ items, className = '' }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-widest ${className}`}
    >
      {/* flex-wrap so a long collection name wraps onto a second line instead of widening the page on phones */}
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, index) =>
          index === items.length - 1 ? (
            <li
              key={item.path}
              aria-current="page"
              className="text-gray-800 normal-case font-semibold truncate max-w-55 sm:max-w-none"
            >
              {item.name}
            </li>
          ) : (
            <li key={item.path} className="flex items-center gap-1.5">
              <Link href={item.path} className="hover:text-brand-navy transition-colors">
                {item.name}
              </Link>
              <ChevronRight className="w-3 h-3" aria-hidden="true" />
            </li>
          )
        )}
      </ol>
    </nav>
  );
}
