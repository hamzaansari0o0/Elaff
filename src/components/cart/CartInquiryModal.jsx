'use client';

import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartInquiryModal({ isOpen, onClose }) {
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (items.some((item) => !item.quantity.trim())) {
      setError('Please enter a quantity for every product.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            productTitle: item.title,
            productSlug: item.slug,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not submit inquiry');
      }

      setIsSuccess(true);
      clearCart();

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
        onClose();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
        <div className="bg-brand-navy p-5 flex items-center justify-between text-white sticky top-0 z-10">
          <h3 className="text-lg font-black uppercase tracking-wide">
            Request Quote {items.length > 0 && `(${items.length} Product${items.length > 1 ? 's' : ''})`}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Request Sent Successfully!</h4>
              <p className="text-sm text-gray-500">
                Our team will review your inquiry and contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              {/* Cart Items */}
              <div className="space-y-2.5">
                {items.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Your cart is empty.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.slug}
                      className="flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-lg p-3"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
                        {item.price && <p className="text-xs text-gray-500">{item.price}</p>}
                      </div>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.slug, e.target.value)}
                        placeholder="Qty (e.g. 500 kg)"
                        className="w-32 border border-gray-300 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-brand-navy shrink-0"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.slug)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    required
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    required
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Additional Details
                </label>
                <textarea
                  name="message"
                  rows="3"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy resize-none"
                  placeholder="Tell us about your shipping requirements or any specific questions..."
                ></textarea>
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                className="w-full bg-brand-cta hover:bg-brand-cta-hover text-white font-extrabold text-sm py-3.5 rounded-lg uppercase tracking-widest transition-colors mt-2 disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
