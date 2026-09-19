import { getAllProducts, getAllCollections } from '@/lib/products';

// NEXT_PUBLIC_SITE_URL must be set to the real production domain (in .env /
// hosting env vars) for these URLs to be correct once deployed — falls back
// to localhost so this still works in dev without it.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const STATIC_ROUTES = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { path: '/collections', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/partners', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
];

export default async function sitemap() {
  const [products, collections] = await Promise.all([getAllProducts(), getAllCollections()]);

  const staticEntries = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const collectionEntries = collections.map((collection) => ({
    url: `${SITE_URL}/collection/${collection.slug}`,
    lastModified: collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const productEntries = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticEntries, ...collectionEntries, ...productEntries];
}
