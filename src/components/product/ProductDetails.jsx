'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Truck, Package, ShoppingCart, ShoppingBag, Check } from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ui/ProductCard';
import OrderModal from '@/components/product/OrderModal';

function InfoTableSection({ section }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-left text-sm">
        <tbody className="divide-y divide-gray-200">
          {section.fields?.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
              <th className="py-3 px-4 font-bold text-gray-700 w-1/3 border-r border-gray-200">{row.label}</th>
              <td className="py-3 px-4 text-gray-600 font-medium">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RichTextSection({ section }) {
  return <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>;
}

function ImageTextSection({ section }) {
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {section.image && (
        <div className="w-full md:w-2/5 shrink-0 rounded-xl overflow-hidden border border-gray-200">
          <img src={section.image} alt={section.title} className="w-full h-56 object-cover" />
        </div>
      )}
      <p className="flex-1 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{section.body}</p>
    </div>
  );
}

function GallerySection({ section }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {section.images?.map((img, idx) => (
        <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
          <img src={img} alt={`${section.title} ${idx + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}

const SECTION_RENDERERS = {
  infoTable: InfoTableSection,
  richText: RichTextSection,
  imageText: ImageTextSection,
  gallery: GallerySection,
};

export default function ProductDetails({ product, related = [] }) {
  const [activeImage, setActiveImage] = useState(product?.images?.[0] || '/placeholder.jpg');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem, isInCart } = useCart();

  if (!product) return <div className="p-10 text-center font-sans font-medium text-gray-500">Loading product...</div>;

  const price = formatPrice(product.price, product.priceUnit);
  const oldPrice = formatPrice(product.oldPrice, '');
  const hasCompanyProfile = product.pageSections?.length > 0;
  const hasRelated = related.length > 0;
  const inCart = isInCart(product.slug);

  const navItems = [
    { id: 'overview', label: 'Overview' },
    ...(hasCompanyProfile ? [{ id: 'company-profile', label: 'Company Profile' }] : []),
    ...(hasRelated ? [{ id: 'related', label: 'Related Products' }] : []),
  ];

  function handleAddToCart() {
    if (inCart) return;
    addItem({ slug: product.slug, title: product.title, image: product.images?.[0] || '', price });
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-[11px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">
          <Link href="/" className="hover:text-brand-navy transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-brand-navy transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800 normal-case font-semibold truncate max-w-55 sm:max-w-none">
            {product.title}
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Hero: gallery + info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Gallery */}
            <div className="w-full lg:w-1/2 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-gray-200 relative">
              {product.badge && (
                <span className="absolute top-8 left-8 z-10 -rotate-6 bg-brand-amber text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md ring-1 ring-inset ring-white/40">
                  {product.badge}
                </span>
              )}
              <div
                className="aspect-square rounded-xl overflow-hidden mb-4 border border-gray-100 flex items-center justify-center bg-slate-50"
                style={{
                  backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                <img src={activeImage} alt={product.title} className="w-full h-full object-contain p-6" />
              </div>

              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === img
                          ? 'border-brand-navy opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-2 text-brand-cyan text-[11px] font-extrabold uppercase tracking-[0.2em] w-max mb-3">
                <span className="w-5 h-px bg-brand-cyan" />
                {product.category || 'Product'}
              </span>

              <h1 className="font-fraunces text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">
                {product.title}
              </h1>

              {product.sku && (
                <p className="text-xs text-gray-400 font-mono tracking-wide mb-5">SKU: {product.sku}</p>
              )}

              {(price || oldPrice) && (
                <div className="flex items-baseline gap-2 mb-5 pb-5 border-b border-dashed border-gray-200">
                  {price && <span className="font-bricolage text-2xl font-extrabold text-gray-900">{price}</span>}
                  {oldPrice && <span className="font-bricolage text-sm text-gray-400 line-through">{oldPrice}</span>}
                </div>
              )}

              {product.shortDescription && (
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.shortDescription}</p>
              )}

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-x-5 gap-y-2.5 mb-6 py-4 border-y border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-brand-amber shrink-0" /> Premium Quality
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <Truck className="w-4 h-4 text-brand-amber shrink-0" /> Global Shipping
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <Package className="w-4 h-4 text-brand-amber shrink-0" /> Bulk Packaging
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2 border-2 font-extrabold text-xs md:text-sm py-3.5 px-5 rounded-xl uppercase tracking-widest transition-colors ${
                    inCart
                      ? 'border-brand-green text-brand-green bg-brand-green/5'
                      : 'border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
                  }`}
                >
                  {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {inCart ? 'Added to Quote' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-cta hover:bg-brand-cta-hover text-white font-extrabold text-xs md:text-sm py-3.5 px-5 rounded-xl uppercase tracking-widest transition-colors shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Place Order / Inquire Now
                </button>
              </div>
              <p className="text-center sm:text-left text-[11px] text-gray-500 mt-3 uppercase tracking-wide">
                Submit an inquiry to get our latest bulk pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Sticky section nav */}
        {navItems.length > 1 && (
          <div className="sticky top-16 z-30 mt-6 -mx-4 px-4 md:mx-0 md:px-0">
            <div className="bg-white/95 backdrop-blur border border-gray-200 rounded-xl shadow-sm flex gap-1 overflow-x-auto scrollbar-hide px-2 py-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-gray-600 hover:bg-slate-50 hover:text-brand-navy transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Overview: specifications + description */}
        {(product.specifications?.length > 0 || product.fullDescription) && (
          <div id="overview" className="mt-6 scroll-mt-32 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-dashed border-gray-200">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              <h2 className="font-fraunces text-lg md:text-xl font-black text-gray-900 uppercase tracking-wide">
                Overview
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-10">
              {product.specifications?.length > 0 && (
                <div className="w-full lg:w-1/2">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-3">Specifications</h3>
                  <InfoTableSection section={{ fields: product.specifications }} />
                </div>
              )}

              {product.fullDescription && (
                <div className="w-full lg:w-1/2 text-sm text-gray-600 leading-relaxed space-y-4">
                  <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-3">
                    Detailed Description
                  </h3>
                  <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Profile: admin-configured dynamic sections */}
        {hasCompanyProfile && (
          <div id="company-profile" className="mt-6 scroll-mt-32 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              <h2 className="font-fraunces text-lg md:text-xl font-black text-gray-900 uppercase tracking-wide">
                Company Profile
              </h2>
            </div>

            {product.pageSections.map((section, idx) => {
              const Renderer = SECTION_RENDERERS[section.type];
              if (!Renderer) return null;
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
                  {section.title && (
                    <h3 className="font-fraunces text-base md:text-lg font-black text-gray-900 uppercase tracking-wide mb-5 pb-4 border-b border-dashed border-gray-200">
                      {section.title}
                    </h3>
                  )}
                  <Renderer section={section} />
                </div>
              );
            })}
          </div>
        )}

        {/* Related Products */}
        {hasRelated && (
          <div id="related" className="mt-6 scroll-mt-32">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              <h2 className="font-fraunces text-lg md:text-xl font-black text-gray-900 uppercase tracking-wide">
                Related Products
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={product.title}
        productSlug={product.slug}
      />
    </div>
  );
}
