// Picks real product photos for the About page's visual sections (hero
// corridor, stack-spread), diversified by collection (not the raw `category`
// string, which is inconsistently filled) so the same 2-3 recent products
// don't dominate every slot.
export function pickDiverseProductImages(products, limit = 12) {
  const withImages = products.filter((p) => p.images?.[0]);

  const seenCollections = new Set();
  const diverse = [];
  for (const p of withImages) {
    const key = p.collections?.[0]?.slug || p.collections?.[0]?._id || 'uncategorized';
    if (!seenCollections.has(key)) {
      seenCollections.add(key);
      diverse.push(p);
    }
  }
  for (const p of withImages) {
    if (diverse.length >= limit) break;
    if (!diverse.includes(p)) diverse.push(p);
  }

  return diverse.slice(0, limit).map((p) => ({ src: p.images[0], alt: p.title }));
}
