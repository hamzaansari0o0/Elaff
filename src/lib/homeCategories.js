// The "Browse our categories" tiles on the home page: one coloured square with a white
// icon per collection. Collections have no cover images, so the icon is chosen from the
// collection's name — the first rule that matches wins, so specific words (seafood, baby,
// frozen) are listed before the broad ones (food, drink) that would otherwise claim them.
//
// Pure (no database, no icon library): `icon` is a lucide-react component name that
// components/home/CategoryTiles.jsx maps to the real icon.
import { pickFooterCollections } from './footerLinks.js';

const RULES = [
  { test: /baby|maternity|infant/i, icon: 'Baby', color: '#35a7d8' },
  { test: /frozen/i, icon: 'Snowflake', color: '#4682b4' },
  { test: /sea\s?food|fish/i, icon: 'Fish', color: '#0e8a9a' },
  { test: /meat|poultry|beef|chicken|mutton/i, icon: 'Drumstick', color: '#d9363e' },
  { test: /energy/i, icon: 'Zap', color: '#6a5acd' },
  { test: /coffee|cocoa|cacao|\btea\b/i, icon: 'Coffee', color: '#6b4f3a' },
  { test: /drink|juice|soda|water/i, icon: 'CupSoda', color: '#2f7fd3' },
  { test: /confection|sweet|candy|chocolate|biscuit|snack/i, icon: 'Candy', color: '#ff69b4' },
  { test: /\boils?\b|condiment|sauce/i, icon: 'Droplets', color: '#e8912d' },
  { test: /fruit/i, icon: 'Apple', color: '#7aa329' },
  { test: /vegetable/i, icon: 'Carrot', color: '#2e9e4f' },
  { test: /feed|fodder/i, icon: 'Wheat', color: '#a8782b' },
  { test: /agri|farm|seed|grain/i, icon: 'Sprout', color: '#228b22' },
  { test: /personal care|household|cleaning|detergent|hygiene|beauty|cosmetic/i, icon: 'SprayCan', color: '#f2b705' },
  { test: /food|beverage|grocer/i, icon: 'UtensilsCrossed', color: '#ff5a1f' },
];

const FALLBACK_ICON = 'ShoppingBasket';

// For a collection no rule recognises: a colour picked from the title, so the same
// collection always gets the same colour (no randomness, no dependence on its position).
const FALLBACK_COLORS = [
  '#4682b4', '#228b22', '#6a5acd', '#6b4f3a', '#ff69b4',
  '#ff6347', '#f2b705', '#ff4500', '#0e8a9a', '#d9363e',
];

function colorFromTitle(title) {
  let sum = 0;
  for (const char of title) sum += char.charCodeAt(0);
  return FALLBACK_COLORS[sum % FALLBACK_COLORS.length];
}

export function categoryStyle(title) {
  const text = String(title ?? '').trim();
  const rule = RULES.find((r) => r.test.test(text));
  if (rule) return { icon: rule.icon, color: rule.color };
  return { icon: FALLBACK_ICON, color: colorFromTitle(text.toLowerCase()) };
}

// Every stocked collection, most products first (so the busiest categories lead the
// row), each with the icon and colour for its tile. Empty collections are left out —
// a tile that opens an empty page helps nobody.
//
// `collections` is from getAllCollections(); `cards` from getCategoryCards().
export function pickHomeCategories(collections, cards) {
  return pickFooterCollections(collections, cards, Infinity).map(({ title, slug }) => ({
    title,
    slug,
    ...categoryStyle(title),
  }));
}
