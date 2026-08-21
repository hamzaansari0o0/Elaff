'use client';

import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.slug);
  const lotCode = (product.sku || product.slug || '').toString().slice(-6).toUpperCase();

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) addItem(product);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-brand-navy/20 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Badge — stamped like a customs mark */}
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 -rotate-6 bg-brand-amber text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md ring-1 ring-inset ring-white/40">
          {product.badge}
        </span>
      )}

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        aria-label={inCart ? 'Added to cart' : 'Add to cart'}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all ${
          inCart
            ? 'bg-brand-green text-white'
            : 'bg-white text-gray-700 hover:text-brand-navy hover:scale-110'
        }`}
      >
        {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
      </button>

      {/* Image */}
      <div
        className="relative w-full h-56 bg-slate-50 overflow-hidden flex items-center justify-center p-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #E2E8F0 1px, transparent 1px)',
          backgroundSize: '14px 14px',
        }}
      >
        {product.image && (
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        )}
        {lotCode && (
          <span className="absolute bottom-2 left-2 font-mono text-[9px] font-semibold text-gray-500 bg-white/85 backdrop-blur-sm px-1.5 py-0.5 rounded tracking-widest">
            LOT #{lotCode}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between text-left">
        <div>
          <span className="font-bricolage text-[10px] font-bold text-brand-cyan uppercase tracking-widest block mb-1.5">
            {product.category}
          </span>
          <h3 className="font-fraunces text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-brand-navy transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price & CTA */}
        <div className="mt-4 pt-3 border-t border-dashed border-gray-200">
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="font-bricolage text-lg font-extrabold text-gray-900">{product.price}</span>
            {product.oldPrice && (
              <span className="font-bricolage text-xs text-gray-400 line-through">{product.oldPrice}</span>
            )}
          </div>

          <span className="w-full bg-brand-cta group-hover:bg-brand-cta-hover text-white text-xs font-bold py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-lg">
            {inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            <span>{inCart ? 'Added to Quote' : 'Place Order'}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
