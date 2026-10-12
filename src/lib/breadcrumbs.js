// The breadcrumb trails shown on product and collection pages, as plain
// { name, path } lists. The visible breadcrumb (components/ui/Breadcrumbs.jsx)
// and the BreadcrumbList structured data are both built from the same trail, so
// what search engines read always matches what visitors see.

const hasTitleAndSlug = (collection) =>
  Boolean(collection && String(collection.title ?? '').trim() && String(collection.slug ?? '').trim());

const collectionCrumb = (collection) => ({
  name: String(collection.title).trim(),
  path: `/collection/${String(collection.slug).trim()}`,
});

// Home > Shop > <the product's collection> > <product>. The collection level
// also gives every collection page a crawlable link from each of its products.
export function productBreadcrumbs(product) {
  const collection = (product.collections || []).find(hasTitleAndSlug);

  return [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    ...(collection ? [collectionCrumb(collection)] : []),
    { name: product.title, path: `/product/${product.slug}` },
  ];
}

// Home > Shop > <collection> — the same path a product in it takes, so both
// pages describe the collection's place in the site identically.
export function collectionBreadcrumbs(collection) {
  return [{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }, collectionCrumb(collection)];
}
