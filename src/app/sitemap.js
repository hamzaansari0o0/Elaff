import { getAllProducts, getAllCollections } from '@/lib/products';
import { getCompanySettings } from '@/lib/settings';
import { getAllArticles } from '@/lib/blog';
import { buildSitemapEntries } from '@/lib/sitemapEntries';

// Without this the sitemap is generated once at build time and never again, so
// products added later would stay out of it until the next deploy. An hour is
// frequent enough for search engines, which only re-read sitemaps now and then.
export const revalidate = 3600;

// The entries (and the "list nothing until NEXT_PUBLIC_SITE_URL is set" rule)
// live in lib/sitemapEntries.js.
export default async function sitemap() {
  const [products, collections, settings] = await Promise.all([
    getAllProducts(),
    getAllCollections(),
    getCompanySettings(),
  ]);

  return buildSitemapEntries({ products, collections, settings, articles: getAllArticles() });
}
