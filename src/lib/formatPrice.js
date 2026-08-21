// Pure, framework-agnostic helper — kept separate from lib/products.js so client
// components can import it without pulling in that module's server-only Mongoose/DB code.
export function formatPrice(amount, unit) {
  if (amount == null) return undefined;
  return `$${Number(amount).toFixed(2)}${unit || ''}`;
}
