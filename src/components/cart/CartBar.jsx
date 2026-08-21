'use client';

import { useState } from 'react';
import { ShoppingCart, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartInquiryModal from './CartInquiryModal';

export default function CartBar() {
  const { items, removeItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* Reserves space at the end of the document so the fixed bar never covers the footer */}
      <div className="h-20" aria-hidden="true" />

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-navy text-white shadow-[0_-8px_30px_rgba(0,0,0,0.25)] border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left: icon + count */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-brand-cta" />
            </div>
            <span className="font-bold text-sm whitespace-nowrap hidden xs:inline">
              {items.length} Product{items.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Center: thumbnails, scrollbar hidden */}
          <div className="hidden sm:flex flex-1 justify-center min-w-0">
            <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide px-1">
              {items.slice(0, 8).map((item) => (
                <div key={item.slug} className="relative group shrink-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-11 h-11 rounded-lg object-cover border border-white/15"
                    />
                  )}
                  <button
                    onClick={() => removeItem(item.slug)}
                    className="absolute -top-1.5 -right-1.5 bg-white text-gray-700 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    aria-label={`Remove ${item.title}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {items.length > 8 && (
                <span className="text-xs text-gray-300 shrink-0 pl-1">+{items.length - 8}</span>
              )}
            </div>
          </div>

          {/* Right: CTA */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-brand-cta hover:bg-brand-cta-hover text-white text-xs font-bold px-5 py-2.5 rounded-full uppercase tracking-wider transition-colors shadow-lg"
          >
            Inquire Now
          </button>
        </div>
      </div>

      <CartInquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
