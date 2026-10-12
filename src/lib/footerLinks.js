// Which collections the footer links to. Most-stocked first, so the footer points
// visitors (and crawlers) at the categories that matter most, with ties broken
// alphabetically so the order is stable. Empty collections are left out: a link
// to a page with nothing on it helps nobody.
//
// `collections` is the list from getAllCollections(); `cards` is the list from
// getCategoryCards(), which carries each collection's productCount.
const DEFAULT_LIMIT = 8;

export function pickFooterCollections(collections, cards, limit = DEFAULT_LIMIT) {
  const counts = new Map((cards || []).map((card) => [card.slug, card.productCount || 0]));

  return (collections || [])
    .map((collection) => ({
      title: String(collection?.title ?? '').trim(),
      slug: String(collection?.slug ?? '').trim(),
    }))
    .filter(({ title, slug }) => title && slug && counts.get(slug) > 0)
    .sort((a, b) => counts.get(b.slug) - counts.get(a.slug) || a.title.localeCompare(b.title))
    .slice(0, limit);
}
