import Breadcrumbs from '@/components/ui/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import BlogCard from '@/components/blog/BlogCard';
import { getAllArticles } from '@/lib/blog';
import { blogBreadcrumbs } from '@/lib/breadcrumbs';
import { pageMetadata, blogLd, breadcrumbLd, BLOG_TITLE, BLOG_DESCRIPTION } from '@/lib/seo';

export const metadata = pageMetadata({ title: BLOG_TITLE, description: BLOG_DESCRIPTION, path: '/blog' });

// The words the banner picture shows under its title, so the alt text can say them for
// anyone (or anything) that cannot read the picture.
const BANNER_TEXT =
  'Plain-language guides for importers, wholesalers and distributors: how to buy frozen food and fresh fruit in bulk, which trade term to choose, what halal and HACCP certification means, and how to ship and check a supplier.';

export default function BlogPage() {
  const articles = getAllArticles();

  return (
    <main className="bg-slate-50 min-h-screen font-sans">
      <JsonLd nodes={[blogLd(articles), breadcrumbLd(blogBreadcrumbs())]} />

      {/* Banner — same as the shop page: full brightness, no overlay. The title is
          written into the picture, so the heading is kept for screen readers/SEO
          but isn't visible. */}
      <h1 className="sr-only">{BLOG_TITLE}</h1>
      <div className="w-full h-56 sm:h-72 md:h-96 3xl:h-[32rem] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/blog-banner.jpg" alt={BANNER_TEXT} fetchPriority="high" decoding="async" className="w-full h-full object-[inherit] block" />
      </div>

      <div className="max-w-7xl 3xl:max-w-[1800px] mx-auto px-4 md:px-8 py-8 md:py-10">
        <Breadcrumbs items={blogBreadcrumbs()} className="mb-6" />

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 text-gray-500 text-sm">
            Our first guides are on the way.
          </div>
        )}
      </div>
    </main>
  );
}
