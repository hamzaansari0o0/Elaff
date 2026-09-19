// src/app/product/[slug]/page.jsx
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, toCardShape } from '@/lib/products';
import { getCompanySettings } from '@/lib/settings';
import ProductDetails from '@/components/product/ProductDetails';

// Refreshes each product's cached page at most once a minute, same pattern
// as the About/home pages — without it, a page rendered once at build time
// (or on first visit) would keep serving stale admin edits indefinitely.
export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: 'Product Not Found | Elaff Trade Co.' };
  }

  const description = product.shortDescription || `${product.title} — wholesale supply from Elaff Trade Co.`;

  return {
    title: `${product.title} | Elaff Trade Co.`,
    description,
    openGraph: {
      title: product.title,
      description,
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
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
    <ProductDetails product={product} related={relatedProducts.map(toCardShape)} company={companySettings} />
  );
}
