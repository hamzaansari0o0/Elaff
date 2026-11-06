// The category list in the shop sidebar. Pure (no database, no icon library) so it can be
// unit-tested; components/shop/ShopSidebar.jsx turns the icon name into the real icon.
import { categoryStyle } from './homeCategories.js';

// `cards` is the list from getCategoryCards(). Returns what the sidebar draws:
// { slug, title, count, icon, color }, A to Z.
//  - the admin's own capitalisation is used (a long name like "Personal Care & Household
//    Cleaning" is unreadable shouted in capitals);
//  - empty collections are left out so the list has no dead ends — except the one being
//    viewed, so it can still show as selected;
//  - icon and colour are the same ones the home page's category tiles use.
export function prepareShopCategories(cards, activeSlug) {
  return (cards || [])
    .filter((card) => card?.slug && (card.productCount > 0 || card.slug === activeSlug))
    .map((card) => {
      const title = card.name || card.title || '';
      return { slug: card.slug, title, count: card.productCount || 0, ...categoryStyle(title) };
    })
    .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));
}

// What the sidebar's "Filter categories" box does: keeps the categories whose name
// contains what was typed (any capitalisation, taken literally).
export function filterShopCategories(list, query) {
  const needle = String(query ?? '').trim().toLowerCase();
  if (!needle) return list;
  return list.filter((category) => category.title.toLowerCase().includes(needle));
}
