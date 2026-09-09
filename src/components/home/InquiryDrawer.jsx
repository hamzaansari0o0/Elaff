'use client';

import { useState } from 'react';
import { X, Send, CircleCheckBig, Loader2 } from 'lucide-react';

const VOLUME_PLACEHOLDER = 'e.g. 5 tons / month, 2 x 20ft containers, 1,000 cartons';

// The /api/inquiries endpoint (shared with the cart's "Request Quote" flow) expects
// an `items` array of { productTitle, productSlug, quantity } — there is no separate
// "category + volume" shape on the backend. Mapping this form's fields onto a single
// item keeps the drawer working through the existing, already-wired endpoint instead
// of introducing a new one.
export default function InquiryDrawer({ isOpen, onClose, categories = [] }) {
  const [formData, setFormData] = useState({ name: '', email: '', category: '', volume: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleClose() {
    onClose();
    if (isSuccess) {
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', email: '', category: '', volume: '', message: '' });
      }, 300);
    }
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
          items: [
            {
              productTitle: formData.category,
              productSlug: categories.find((c) => c.title === formData.category)?.slug || '',
              quantity: formData.volume,
            },
          ],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not submit your inquiry');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer: slides in from the right. Hiding is deliberately doubled up —
          the translate-x-full transform for the slide animation, plus
          visibility/pointer-events as a hard fallback — so a stuck or
          not-yet-applied transform (seen on some Chrome/macOS builds) can't
          leave this sitting open and clickable on top of the page. */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-full sm:w-[440px] bg-[#0a0e16] text-white z-[70] shadow-2xl flex flex-col transform transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="B2B inquiry form"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="relative shrink-0 overflow-hidden border-b border-white/10 px-6 py-6">
          <div className="absolute -top-16 -right-10 w-52 h-52 rounded-full bg-brand-cta/25 blur-[100px] pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-cta mb-1.5">B2B Inquiry</p>
              <h3 className="font-fraunces text-xl font-black leading-tight">Send Us Your Requirements</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close inquiry form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-10">
              <div className="w-14 h-14 rounded-full bg-brand-cta/15 text-brand-cta flex items-center justify-center mb-4">
                <CircleCheckBig className="w-7 h-7" />
              </div>
              <p className="font-fraunces text-lg font-bold mb-1.5">Inquiry received</p>
              <p className="text-sm text-white/50 max-w-xs mb-6">
                Thanks — our trade team will review your requirements and respond shortly.
              </p>
              <button
                onClick={handleClose}
                className="text-xs font-bold text-brand-cta hover:underline uppercase tracking-wide"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-cta transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">
                  Business Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-cta transition-colors"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">
                  Product Category *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-white outline-none focus:border-brand-cta transition-colors [&>option]:bg-[#0a0e16] [&>option]:text-white"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                  <option value="Other / Multiple Categories">Other / Multiple Categories</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">
                  Estimated Order Volume *
                </label>
                <input
                  type="text"
                  name="volume"
                  required
                  value={formData.volume}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-cta transition-colors"
                  placeholder={VOLUME_PLACEHOLDER}
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-wide mb-1.5">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-brand-cta transition-colors resize-none"
                  placeholder="Tell us about your sourcing needs, target markets, or timeline..."
                />
              </div>

              {error && (
                <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-60 text-white font-extrabold text-sm py-3.5 rounded-xl uppercase tracking-widest transition-colors shadow-[0_0_40px_-10px_rgba(13,148,136,0.6)] mt-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}
