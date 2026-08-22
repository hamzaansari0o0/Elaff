'use client';

import { useState } from 'react';
import { Clock, BadgeDollarSign, ShieldCheck, ShoppingCart, Check, Send } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const MESSAGE_LIMIT = 1000;

export default function InlineInquiryForm({ product, companyName, price }) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.slug);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MESSAGE_LIMIT) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddToCart() {
    if (inCart) return;
    addItem({ slug: product.slug, title: product.title, image: product.images?.[0] || '', price });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
          items: [{ productTitle: product.title, productSlug: product.slug, quantity: 'Please advise' }],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not submit inquiry');
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
        <h2 className="font-fraunces text-lg md:text-xl font-black text-gray-900 uppercase tracking-wide">
          Send an Inquiry
        </h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Interested in this product? Send us your requirements and we&apos;ll get back to you.
      </p>

      {isSuccess ? (
        <div className="flex flex-col items-center justify-center text-center py-10">
          <div className="w-14 h-14 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
            <Check className="w-7 h-7" />
          </div>
          <p className="text-sm font-bold text-gray-800 mb-1">Inquiry sent</p>
          <p className="text-xs text-gray-500">Our team will review it and get back to you shortly.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: form fields */}
          <div className="space-y-4">
            {companyName && (
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">To</label>
                <p className="text-sm font-bold text-brand-navy">{companyName}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy resize-none"
                placeholder="Please provide details such as order quantity, destination port, and any other specific requirements."
              />
              <p className="text-right text-[11px] text-gray-400 mt-1">
                {formData.message.length} / {MESSAGE_LIMIT}
              </p>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          {/* Right: reassurance + actions */}
          <div className="flex flex-col">
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Quick Response</p>
                  <p className="text-xs text-gray-500">We respond within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BadgeDollarSign className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Best Price</p>
                  <p className="text-xs text-gray-500">Competitive wholesale pricing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-gray-800">Trusted Supplier</p>
                  <p className="text-xs text-gray-500">Verified &amp; reliable exporter</p>
                </div>
              </div>
            </div>

            <div className="mt-auto flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-60 text-white font-extrabold text-xs md:text-sm py-3.5 px-5 rounded-xl uppercase tracking-widest transition-colors shadow-lg"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Sending...' : 'Send Inquiry Now'}
              </button>
              <button
                type="button"
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
        </form>
      )}
    </div>
  );
}
