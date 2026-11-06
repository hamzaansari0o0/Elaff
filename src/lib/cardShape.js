// Shapes a full product document into the compact card format the storefront cards use.
// Kept free of database code (unlike lib/products.js, which re-exports this) so it can be
// unit-tested and imported anywhere.
import { formatPrice, hasDiscount } from './formatPrice.js';

export function toCardShape(p) {
  const discounted = hasDiscount(p.price, p.oldPrice);

  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: (p.category || '').toUpperCase(),
    price: formatPrice(p.price, p.priceUnit),
    priceValue: typeof p.price === 'number' ? p.price : null,
    priceUnit: p.priceUnit || '',
    oldPrice: formatPrice(p.oldPrice, ''),
    image: p.images?.[0] || '',
    badge: p.badge || undefined,
    // Shows the sale mark: the admin tagged it onSale, or it is genuinely reduced.
    onSale: (p.tags || []).includes('onSale') || discounted,
    // Only a real reduction may show the old price struck through.
    discounted,
  };
}
