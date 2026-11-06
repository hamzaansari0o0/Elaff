// Pure, framework-agnostic helper — kept separate from lib/products.js so client
// components can import it without pulling in that module's server-only Mongoose/DB code.
export function formatPrice(amount, unit) {
  if (amount == null) return undefined;
  return `$${Number(amount).toFixed(2)}${unit || ''}`;
}

// True when a product is genuinely reduced: both prices are real numbers and the
// old one is higher. Drives the sale badge on the home page product cards.
export function hasDiscount(price, oldPrice) {
  return typeof price === 'number' && typeof oldPrice === 'number' && oldPrice > price;
}
