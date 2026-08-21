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
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-brand-navy text-white shadow-[0_-4px_20px_rgba(0,0,0,0.2)] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 overflow-x-auto">
            <div className="flex items-center gap-2 shrink-0">
              <ShoppingCart className="w-5 h-5 text-brand-cta" />
              <span className="font-bold text-sm whitespace-nowrap">
                {items.length} Product{items.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {items.slice(0, 6).map((item) => (
                <div key={item.slug} className="relative group shrink-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-10 h-10 rounded-lg object-cover border border-white/20"
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
              {items.length > 6 && (
                <span className="text-xs text-gray-300 shrink-0">+{items.length - 6} more</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="shrink-0 bg-brand-cta hover:bg-brand-cta-hover text-white text-xs font-bold px-5 py-2.5 rounded-lg uppercase tracking-wider transition-colors"
          >
            Inquire Now
          </button>
        </div>
      </div>

      <CartInquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
