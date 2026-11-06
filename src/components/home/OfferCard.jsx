import Link from 'next/link';
import { BadgePercent, ChevronRight } from 'lucide-react';
import { optimizedImage } from '@/lib/imageUrl';
import { formatPrice } from '@/lib/formatPrice';

// The compact product card used in the home page strips (Latest On Sale, Weekly
// Featured, Bestsellers): sale mark, photo, name, price with the old price struck
// through, and a yellow arrow into the product page. `product` is a toCardShape() card.
//
// Most products have no price (they are quoted on inquiry), so those show "Ask for price"
// instead of an empty gap.
export default function OfferCard({ product }) {
  const { slug, title, image, priceValue, priceUnit, oldPrice, onSale, discounted, badge } = product;
  const hasPrice = typeof priceValue === 'number';

  return (
    <Link
      href={`/product/${slug}`}
      title={title}
      className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[10/9] overflow-hidden rounded-xl bg-white">
        {onSale ? (
          <BadgePercent
            role="img"
            aria-label="On sale"
            className="absolute left-0.5 top-0.5 z-10 h-7 w-7 fill-red-500 text-white drop-shadow"
            strokeWidth={1.75}
          />
        ) : badge ? (
          <span className="absolute left-1 top-1 z-10 rounded-full bg-brand-amber px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow">
            {badge}
          </span>
        ) : null}

        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={optimizedImage(image, 400)}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <p className="mt-3 line-clamp-2 min-h-[2.6em] text-[15px] leading-[1.3] text-gray-900">{title}</p>

      <div className="mt-auto flex items-end justify-between gap-2 pt-3">
        <div className="min-w-0">
          {hasPrice ? (
            <>
              <p className="flex flex-wrap items-baseline gap-x-1 leading-tight">
                <span className="text-xl font-extrabold text-brand-navy">{formatPrice(priceValue, '')}</span>
                {priceUnit && <span className="text-[11px] font-semibold text-gray-500">{priceUnit.trim()}</span>}
              </p>
              {discounted && oldPrice && <p className="text-sm leading-tight text-gray-400 line-through">{oldPrice}</p>}
            </>
          ) : (
            <p className="text-[13px] font-semibold leading-tight text-gray-500">Ask for price</p>
          )}
        </div>

        <span
          aria-hidden="true"
          className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-amber-400 text-brand-navy transition-colors group-hover:bg-amber-500"
        >
          <ChevronRight className="h-5 w-5" />
        </span>
      </div>
    </Link>
  );
}
