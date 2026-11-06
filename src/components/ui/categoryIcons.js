import {
  Apple,
  Baby,
  Candy,
  Carrot,
  Coffee,
  CupSoda,
  Droplets,
  Drumstick,
  Fish,
  ShoppingBasket,
  Snowflake,
  SprayCan,
  Sprout,
  UtensilsCrossed,
  Wheat,
  Zap,
} from 'lucide-react';

// lib/homeCategories.js picks an icon for a collection by NAME (so it stays free of the
// icon library); this maps each name to the real icon. Shared by the home page's category
// tiles and the shop sidebar so a collection looks the same in both.
const CATEGORY_ICONS = { Apple, Baby, Candy, Carrot, Coffee, CupSoda, Droplets, Drumstick, Fish, ShoppingBasket, Snowflake, SprayCan, Sprout, UtensilsCrossed, Wheat, Zap };

export function categoryIcon(name) {
  return CATEGORY_ICONS[name] ?? ShoppingBasket;
}
