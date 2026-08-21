'use client';

import Link from 'next/link';
import { ShoppingBag, ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductCard({ product }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.slug);

  function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!inCart) addItem(product);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative"
    >
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-3 left-3 bg-brand-amber text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full z-10 uppercase tracking-wider">
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
      <div className="relative w-full h-56 bg-gray-50 overflow-hidden flex items-center justify-center p-4">
        {product.image && (
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between text-center">
        <div>
          <span className="font-bricolage text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
            {product.category}
          </span>
          <h3 className="font-fraunces text-sm font-bold text-gray-800 line-clamp-2 hover:text-brand-navy cursor-pointer transition-colors mb-2">
            {product.title}
          </h3>
        </div>

        {/* Price & CTA */}
        <div className="mt-3">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="font-bricolage text-base font-extrabold text-gray-900">{product.price}</span>
            {product.oldPrice && (
              <span className="font-bricolage text-xs text-gray-400 line-through">{product.oldPrice}</span>
            )}
          </div>

          <span className="w-full bg-brand-cta group-hover:bg-brand-cta-hover text-white text-xs font-bold py-2.5 px-4 rounded-lg uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md group-hover:shadow-lg">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Place Order</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
