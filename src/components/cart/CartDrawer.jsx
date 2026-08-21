'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import CartInquiryModal from './CartInquiryModal';

export default function CartDrawer({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);

  function handleInquire() {
    onClose();
    setIsInquiryOpen(true);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={onClose}
      />

      {/* Drawer: slides in from the right */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[88%] max-w-md bg-white z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-brand-navy text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-brand-cta" />
            <h3 className="font-fraunces font-black text-sm uppercase tracking-wide">
              Your Cart {items.length > 0 && `(${items.length})`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <ShoppingCart className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-sm font-bold text-gray-700 mb-1">Your cart is empty</p>
              <p className="text-xs text-gray-500 mb-5">Add products to request a bulk quote.</p>
              <Link
                href="/shop"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy hover:underline uppercase tracking-wide"
              >
                Browse Products <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-3 bg-slate-50 border border-gray-200 rounded-xl p-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 line-clamp-2">{item.title}</p>
                    {item.price && <p className="text-xs text-gray-500 mt-0.5">{item.price}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.slug, e.target.value)}
                        placeholder="Qty"
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-xs outline-none focus:border-brand-navy bg-white"
                      />
                      <button
                        onClick={() => removeItem(item.slug)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-white shrink-0 space-y-2.5">
            <button
              onClick={handleInquire}
              className="w-full bg-brand-cta hover:bg-brand-cta-hover text-white font-extrabold text-sm py-3.5 rounded-xl uppercase tracking-widest transition-colors shadow-lg"
            >
              Request Quote ({items.length})
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors py-1"
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>

      <CartInquiryModal isOpen={isInquiryOpen} onClose={() => setIsInquiryOpen(false)} />
    </>
  );
}
