// src/app/product/[slug]/page.jsx
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, toCardShape } from '@/lib/products';
import { getCompanySettings } from '@/lib/settings';
import ProductDetails from '@/components/product/ProductDetails';
import { pageMetadata, metaDescription, productLd, breadcrumbLd, SITE_NAME } from '@/lib/seo';
import { productBreadcrumbs } from '@/lib/breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import FaqSection from '@/components/seo/FaqSection';
import { productFaqs } from '@/lib/faqs';

// Refreshes each product's cached page at most once a minute, same pattern
// as the About/home pages — without it, a page rendered once at build time
// (or on first visit) would keep serving stale admin edits indefinitely.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  return pageMetadata({
    title: product.title,
    description: metaDescription(
      product.shortDescription,
      product.fullDescription,
      `${product.title} — wholesale supply from ${SITE_NAME}.`
    ),
    path: `/product/${product.slug}`,
    image: product.images?.[0],
    // Drafts stay reachable by URL (so they can be previewed) but must not show up in search results.
    noindex: product.status !== 'active',
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, companySettings] = await Promise.all([
    getRelatedProducts(product),
    getCompanySettings(),
  ]);

  return (
    <>
      {/* Drafts are kept out of search results, so they get no structured data either. */}
      {product.status === 'active' && <JsonLd nodes={[productLd(product), breadcrumbLd(productBreadcrumbs(product))]} />}
      <ProductDetails
        product={product}
        related={relatedProducts.map(toCardShape)}
        company={companySettings}
        faq={<FaqSection items={productFaqs(product, companySettings)} path={`/product/${product.slug}`} />}
      />
    </>
  );
}
