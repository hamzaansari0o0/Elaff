'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  Package,
  Globe,
  Tag,
  Search,
  ShoppingCart,
  ShoppingBag,
  Check,
  Clock,
  Boxes,
  BadgeCheck,
} from 'lucide-react';
import { formatPrice } from '@/lib/formatPrice';
import { useCart } from '@/context/CartContext';
import OrderModal from '@/components/product/OrderModal';
import ProductProfileTabs from '@/components/product/ProductProfileTabs';
import InlineInquiryForm from '@/components/product/InlineInquiryForm';
import RelatedProductsCarousel from '@/components/product/RelatedProductsCarousel';

// lucide-react dropped brand/logo icons — small inline marks for the share row instead.
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}
function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.5 22H1.4l8.1-9.3L1 2h7.1l4.9 6.1L18.9 2Zm-1.2 18h1.7L7.4 4H5.6l12.1 16Z" />
    </svg>
  );
}
function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.84v1.64h.05c.53-1 1.84-2.06 3.79-2.06C21.9 8.58 23 11.03 23 14.2V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.31 1.57-2.31 3.2V21h-4V9Z" />
    </svg>
  );
}

function ShareButtons({ title }) {
  function share(kind) {
    if (typeof window === 'undefined') return;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    window.open(shareUrls[kind], '_blank', 'noopener,noreferrer,width=600,height=500');
  }

  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share</span>
      {[
        { kind: 'facebook', Icon: FacebookIcon, label: 'Share on Facebook' },
        { kind: 'twitter', Icon: XIcon, label: 'Share on X' },
        { kind: 'linkedin', Icon: LinkedinIcon, label: 'Share on LinkedIn' },
      ].map(({ kind, Icon, label }) => (
        <button
          key={kind}
          type="button"
          onClick={() => share(kind)}
          aria-label={label}
          className="p-1.5 text-gray-400 hover:text-brand-navy transition-colors"
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  );
}

function iconForSpecLabel(label = '') {
  const l = label.toLowerCase();
  if (l.includes('origin') || l.includes('country')) return Globe;
  if (l.includes('volume') || l.includes('size') || l.includes('weight') || l.includes('capacity')) return Package;
  return Tag;
}

function Gallery({ product }) {
  const images = product.images?.length ? product.images : ['/placeholder.jpg'];
  const [activeImage, setActiveImage] = useState(images[0]);
  const [zoomStyle, setZoomStyle] = useState({ transform: 'scale(1)' });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(1.7)' });
  }

  return (
    <div className="flex gap-3">
      {/* Vertical thumbnail rail (desktop) */}
      {images.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 w-16 shrink-0 max-h-[420px] overflow-y-auto scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                activeImage === img ? 'border-brand-navy opacity-100' : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div
          className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-slate-50 cursor-zoom-in"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomStyle({ transform: 'scale(1)' })}
        >
          {product.badge && (
            <span className="absolute top-4 left-4 z-10 -rotate-6 bg-brand-amber text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md ring-1 ring-inset ring-white/40">
              {product.badge}
            </span>
          )}
          <span className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-md">
            <Search className="w-3.5 h-3.5 text-gray-500" />
          </span>
          <img
            src={activeImage}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-200"
            style={zoomStyle}
          />
        </div>

        {/* Horizontal thumbnails (mobile/tablet) */}
        {images.length > 1 && (
          <div className="flex md:hidden gap-3 overflow-x-auto scrollbar-hide pt-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === img ? 'border-brand-navy opacity-100' : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${product.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="pt-4">
          <ShareButtons title={product.title} />
        </div>
      </div>
    </div>
  );
}

function WhyChooseBanner({ product }) {
  const points = [
    { Icon: ShieldCheck, title: 'Premium Quality', sub: 'Verified sourcing standards' },
    { Icon: Truck, title: 'Global Shipping', sub: 'Delivered worldwide' },
    { Icon: Package, title: 'Bulk Packaging', sub: 'Export-ready cartons' },
    { Icon: BadgeCheck, title: 'Certified & Trusted', sub: 'Backed by our guarantee' },
  ];

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm px-6 md:px-10 py-8 md:py-10">
      <div className="relative text-center max-w-xl mx-auto mb-8">
        <h2 className="font-fraunces text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide">
          Why Choose {product.title}?
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          {product.shortDescription || 'Sourced and shipped to the standard our wholesale buyers expect.'}
        </p>
      </div>

      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6">
        {points.map(({ Icon, title, sub }) => (
          <div key={title} className="flex flex-col items-center text-center gap-2">
            <div className="w-11 h-11 rounded-full bg-brand-amber/10 text-brand-amber flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">{title}</p>
            <p className="text-[11px] text-gray-500">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetails({ product, related = [], company = null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem, isInCart } = useCart();

  if (!product) return <div className="p-10 text-center font-sans font-medium text-gray-500">Loading product...</div>;

  const price = formatPrice(product.price, product.priceUnit);
  const oldPrice = formatPrice(product.oldPrice, '');
  const inCart = isInCart(product.slug);
  const quickSpecs = (product.specifications || []).slice(0, 3);

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

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        {/* Hero: gallery + info */}
        <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left: Gallery */}
            <div className="w-full lg:w-[45%] p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-gray-200">
              <Gallery product={product} />
            </div>

            {/* Right: Info */}
            <div className="w-full lg:w-[55%] p-6 md:p-8 flex flex-col justify-center">
              {product.badge && (
                <span className="inline-block w-max bg-brand-amber/10 text-brand-amber text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
                  {product.badge}
                </span>
              )}

              <h1 className="font-fraunces text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-1">
                {product.title}
              </h1>
              {product.category && <p className="text-sm text-gray-500 mb-4">{product.category}</p>}

              {quickSpecs.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-5 pb-5 border-b border-gray-100">
                  {quickSpecs.map((spec, i) => {
                    const Icon = iconForSpecLabel(spec.label);
                    return (
                      <div key={i} className="flex items-start gap-2">
                        <Icon className="w-4 h-4 text-brand-navy shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide truncate">{spec.label}</p>
                          <p className="text-xs font-bold text-gray-800 truncate">{spec.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {(price || oldPrice) && (
                <div className="flex items-baseline gap-2 mb-1">
                  {price && <span className="font-bricolage text-2xl font-extrabold text-gray-900">{price}</span>}
                  {oldPrice && <span className="font-bricolage text-sm text-gray-400 line-through">{oldPrice}</span>}
                </div>
              )}
              {(product.leadTime || product.moq) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-5 text-xs text-gray-600">
                  {product.leadTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-brand-navy shrink-0" />
                      Lead Time: <span className="font-semibold text-gray-800">{product.leadTime}</span>
                    </span>
                  )}
                  {product.moq && (
                    <span className="flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-brand-navy shrink-0" />
                      Min. Order: <span className="font-semibold text-gray-800">{product.moq}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy-hover text-white font-extrabold text-xs md:text-sm py-3.5 px-5 rounded-xl uppercase tracking-widest transition-colors shadow-lg hover:shadow-xl"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Send Inquiry
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 border-2 font-extrabold text-xs md:text-sm py-3.5 px-5 rounded-xl uppercase tracking-widest transition-colors ${
                    inCart
                      ? 'border-brand-green text-brand-green bg-brand-green/5'
                      : 'border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white'
                  }`}
                >
                  {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                  {inCart ? 'Added' : 'Add to Inquiry List'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose banner */}
        <WhyChooseBanner product={product} />

        {/* Product dossier: tabs for details / company profile / certificates / shipping */}
        <ProductProfileTabs product={product} company={company} />

        {/* Send an Inquiry */}
        <InlineInquiryForm product={product} companyName={company?.companyName} price={price} />

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
              <h2 className="font-fraunces text-lg md:text-xl font-black text-gray-900 uppercase tracking-wide">
                Related Products from This Supplier
              </h2>
            </div>
            <RelatedProductsCarousel products={related} />
          </div>
        )}
      </div>

      <OrderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={product} company={company} />
    </div>
  );
}
