// Builds the sitemap's entries from catalog data. No database code lives here,
// so it can be tested on its own; app/sitemap.js fetches the data and calls it.
// (Imports carry a ".js" extension so Node's test runner can load this file.)
import { absoluteUrl, CAN_ADDRESS_PAGES } from './seo.js';

// The fixed pages. `datedBy` says where a page's "last modified" date comes
// from; About and Partners have none, because they are written by hand and an
// invented date is worse than leaving it out. changeFrequency and priority are
// only hints that search engines largely ignore.
const FIXED_PAGES = [
  { path: '/', changeFrequency: 'daily', priority: 1, datedBy: 'catalog' },
  { path: '/shop', changeFrequency: 'daily', priority: 0.9, datedBy: 'catalog' },
  { path: '/collections', changeFrequency: 'weekly', priority: 0.8, datedBy: 'catalog' },
  // The blog list is dated by its newest article, and left out until there is one.
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8, datedBy: 'articles', needsArticles: true },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/partners', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5, datedBy: 'settings' },
];

// Next writes URLs into the XML exactly as given, without escaping, so one "&"
// in an image link (common in photo-CDN URLs) would make the whole file invalid.
function xmlSafe(url) {
  return url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// The newest valid date among `values` as an ISO string, or undefined if none is readable.
function newest(values) {
  const times = values.map((value) => Date.parse(value)).filter((time) => !Number.isNaN(time));
  return times.length > 0 ? new Date(Math.max(...times)).toISOString() : undefined;
}

function imageUrls(list) {
  return (list || [])
    .filter((src) => typeof src === 'string' && src.trim() !== '')
    .map((src) => xmlSafe(absoluteUrl(src.trim())));
}

// Drops unset fields so they don't appear in the XML.
function entry(fields) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0))
  );
}

// `products` and `collections` are the active catalog as returned by
// lib/products.js (products with their collections populated); `settings` is
// the Company Settings document; `articles` are the blog articles from
// lib/blog.js (each with a slug and an `updated` date).
export function buildSitemapEntries({ products = [], collections = [], settings, articles = [] } = {}) {
  // Without a real site URL every address would be localhost, which search
  // engines ignore — so list nothing until NEXT_PUBLIC_SITE_URL is set.
  if (!CAN_ADDRESS_PAGES) return [];

  const dateOf = {
    catalog: newest([...products, ...collections].map((item) => item.updatedAt)),
    settings: newest([settings?.updatedAt]),
    articles: newest(articles.map((article) => article.updated)),
  };

  // A collection page lists its products, so a product change is a collection change.
  const productDatesByCollection = new Map();
  for (const product of products) {
    for (const collection of product.collections || []) {
      if (!collection?.slug) continue;
      const dates = productDatesByCollection.get(collection.slug) || [];
      dates.push(product.updatedAt);
      productDatesByCollection.set(collection.slug, dates);
    }
  }

  const fixedEntries = FIXED_PAGES.filter(({ needsArticles }) => !needsArticles || articles.length > 0).map(
    ({ path, changeFrequency, priority, datedBy }) =>
      entry({
        url: xmlSafe(absoluteUrl(path)),
        lastModified: datedBy && dateOf[datedBy],
        changeFrequency,
        priority,
      })
  );

  const collectionEntries = collections.map((collection) =>
    entry({
      url: xmlSafe(absoluteUrl(`/collection/${collection.slug}`)),
      lastModified: newest([collection.updatedAt, ...(productDatesByCollection.get(collection.slug) || [])]),
      images: imageUrls([collection.image]),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  );

  const productEntries = products.map((product) =>
    entry({
      url: xmlSafe(absoluteUrl(`/product/${product.slug}`)),
      lastModified: newest([product.updatedAt]),
      images: imageUrls(product.images),
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  );

  const articleEntries = articles.map((article) =>
    entry({
      url: xmlSafe(absoluteUrl(`/blog/${article.slug}`)),
      lastModified: newest([article.updated]),
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  );

  return [...fixedEntries, ...collectionEntries, ...productEntries, ...articleEntries];
}
