'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Truck, Package } from 'lucide-react';
import OrderModal from '@/components/product/OrderModal'; 

export default function ProductDetails({ product }) {
  const [activeImage, setActiveImage] = useState(product?.images?.[0] || '/placeholder.jpg');
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!product) return <div className="p-10 text-center font-sans font-medium text-gray-500">Loading product...</div>;

  return (
    <div className="bg-slate-50 min-h-screen pb-16 font-sans">
      
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center gap-2 text-[11px] md:text-xs text-gray-500 font-semibold uppercase tracking-wider">
          <Link href="/" className="hover:text-brand-navy">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-brand-navy">Products</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-800">{product.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Column: Image Gallery */}
            <div className="w-full lg:w-1/2 p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-gray-200">
              {/* Main Image */}
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-100">
                <img 
                  src={activeImage} 
                  alt={product.title} 
                  className="w-full h-full object-cover object-center"
                />
              </div>
              
              {/* Thumbnails */}
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images?.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === img ? 'border-brand-navy opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Product Info & Actions */}
            <div className="w-full lg:w-1/2 p-6 md:p-10 flex flex-col justify-center">
              <span className="inline-block bg-brand-cyan/10 text-brand-cyan text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest w-max mb-4">
                {product.category || 'Category'}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2 uppercase">
                {product.title}
              </h1>
              
              <p className="text-sm text-gray-500 font-medium mb-6">
                SKU: <span className="text-gray-800">{product.sku || 'N/A'}</span>
              </p>

              <div className="prose prose-sm text-gray-600 mb-8">
                <p>{product.shortDescription}</p>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 mb-8 py-4 border-y border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <ShieldCheck className="w-5 h-5 text-brand-amber" /> Premium Quality
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <Truck className="w-5 h-5 text-brand-amber" /> Global Shipping
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                  <Package className="w-5 h-5 text-brand-amber" /> Bulk Packaging
                </div>
              </div>

              {/* Call to Action */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-brand-cta hover:bg-brand-cta-hover text-white font-extrabold text-sm md:text-base py-4 rounded-xl uppercase tracking-widest transition-colors shadow-lg hover:shadow-xl"
              >
                Place Order / Inquire Now
              </button>
              <p className="text-center text-[11px] text-gray-500 mt-3 uppercase tracking-wide">
                Submit an inquiry to get our latest bulk pricing.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Specifications Table & Full Details */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
          <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase mb-6 border-b border-gray-200 pb-4">
            Product Specifications
          </h2>
          
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Table Area */}
            <div className="w-full lg:w-1/2">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-200">
                    {product.specifications?.map((spec, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                        <th className="py-3 px-4 font-bold text-gray-700 w-1/3 border-r border-gray-200">
                          {spec.label}
                        </th>
                        <td className="py-3 px-4 text-gray-600 font-medium">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Description Area */}
            <div className="w-full lg:w-1/2 text-sm text-gray-600 leading-relaxed space-y-4">
              <h3 className="font-bold text-gray-900 uppercase text-base mb-2">Detailed Description</h3>
              {/* Product description content */}
              <div dangerouslySetInnerHTML={{ __html: product.fullDescription }} />
            </div>
          </div>
        </div>
      </div>

      {/* Render Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productName={product.title}
        productSlug={product.slug}
      />
    </div>
  );
}