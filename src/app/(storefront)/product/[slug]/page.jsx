// src/app/product/[slug]/page.jsx
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/products';
import ProductDetails from '@/components/product/ProductDetails';

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
