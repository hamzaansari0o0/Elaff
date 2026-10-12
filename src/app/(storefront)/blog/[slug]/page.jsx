import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ProductCard from '@/components/ui/ProductCard';
import JsonLd from '@/components/seo/JsonLd';
import FaqSection from '@/components/seo/FaqSection';
import BlogCard from '@/components/blog/BlogCard';
import ArticleCta from '@/components/blog/ArticleCta';
import { getAllArticles, getArticleBySlug } from '@/lib/blog';
import { formatDate } from '@/lib/blogParse';
import { getProductBySlug, getCollectionBySlug, toCardShape } from '@/lib/products';
import { getCompanySettings } from '@/lib/settings';
import { articleBreadcrumbs } from '@/lib/breadcrumbs';
import { pageMetadata, articleLd, breadcrumbLd, SITE_NAME } from '@/lib/seo';

// Only the articles in content/blog exist; any other address is a 404.
export const dynamicParams = false;

const MAX_RELATED_PRODUCTS = 4;
const MORE_GUIDES = 2;

export function generateStaticParams() {
  return getAllArticles().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/blog/${article.slug}`,
    article: { publishedTime: article.date, modifiedTime: article.updated },
  });
}

// The products an article names, as cards. A product that has since been
// removed or switched to draft is skipped rather than breaking the page.
async function relatedProducts(slugs) {
  const found = await Promise.all(slugs.map((slug) => getProductBySlug(slug)));
  return found
    .filter((product) => product && product.status === 'active')
    .slice(0, MAX_RELATED_PRODUCTS)
    .map(toCardShape);
}

async function relatedCollections(slugs) {
  const found = await Promise.all(slugs.map((slug) => getCollectionBySlug(slug)));
  return found.filter(Boolean).map(({ title, slug }) => ({ title, slug }));
}

// The next articles after this one in the list, wrapping around, so every
// article links on to others.
function moreGuides(current) {
  const all = getAllArticles();
  const index = all.findIndex((article) => article.slug === current.slug);
  return Array.from({ length: Math.min(MORE_GUIDES, all.length - 1) }, (_, offset) => all[(index + 1 + offset) % all.length]);
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [settings, products, collections] = await Promise.all([
    getCompanySettings(),
    relatedProducts(article.products),
    relatedCollections(article.collections),
  ]);
  const trail = articleBreadcrumbs(article);
  const others = moreGuides(article);

  return (
    <main className="bg-slate-50 min-h-screen py-10 font-sans">
      <JsonLd nodes={[articleLd(article, settings), breadcrumbLd(trail)]} />
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <Breadcrumbs items={trail} className="mb-6" />

        <article>
          <header>
            <span className="text-brand-cyan text-xs font-extrabold uppercase tracking-widest">Buyer&apos;s guide</span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mt-2 leading-tight">{article.title}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-semibold">
              <span>By {SITE_NAME}</span>
              <span aria-hidden="true">·</span>
              <span>
                Published <time dateTime={article.date}>{formatDate(article.date)}</time>
              </span>
              {article.updated !== article.date && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>
                    Updated <time dateTime={article.updated}>{formatDate(article.updated)}</time>
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{article.readingMinutes} min read</span>
            </p>
          </header>

          <div
            className="blog-prose mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
        </article>

        <div className="mt-10">
          <FaqSection items={article.faq} path={`/blog/${article.slug}`} />
        </div>

        {products.length > 0 && (
          <section className="mt-12" aria-labelledby="related-products">
            <h2 id="related-products" className="font-fraunces text-xl md:text-2xl font-black text-gray-900 mb-5">
              Related products
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <ArticleCta collections={collections} />
        </div>

        {others.length > 0 && (
          <section className="mt-12" aria-labelledby="more-guides">
            <h2 id="more-guides" className="font-fraunces text-xl md:text-2xl font-black text-gray-900 mb-5">
              More guides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {others.map((other) => (
                <BlogCard key={other.slug} article={other} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
