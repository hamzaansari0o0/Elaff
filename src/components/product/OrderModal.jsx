'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

const UNITS = ['Cartons', 'Pallets', 'Tons', 'Kg', 'Pieces', 'Containers', 'Other'];

const UNIT_FROM_PRICE_UNIT = {
  ton: 'Tons',
  tons: 'Tons',
  carton: 'Cartons',
  cartons: 'Cartons',
  kg: 'Kg',
  piece: 'Pieces',
  pieces: 'Pieces',
  pallet: 'Pallets',
  pallets: 'Pallets',
  container: 'Containers',
  containers: 'Containers',
};

function inferUnit(priceUnit) {
  if (!priceUnit) return UNITS[0];
  const cleaned = priceUnit.replace('/', '').trim().toLowerCase();
  return UNIT_FROM_PRICE_UNIT[cleaned] || UNITS[0];
}

const PAYMENT_TERMS = ['No preference', 'T/T', 'L/C', 'Western Union', 'Other'];

const QUICK_MESSAGES = [
  { value: '', label: 'Quick message (optional)' },
  {
    value: 'bulk-pricing',
    label: "I'm interested in bulk pricing",
    text: "I'm interested in bulk pricing for this product. Please share your best wholesale rate for the quantity above.",
  },
  {
    value: 'samples',
    label: 'Request product samples',
    text: 'Could you share your sample policy and cost for this product before we place a bulk order?',
  },
  {
    value: 'long-term',
    label: 'Long-term supply agreement',
    text: "We're looking for a reliable long-term supplier for this product. Please share terms for an ongoing supply agreement.",
  },
  {
    value: 'shipping',
    label: 'Shipping cost estimate',
    text: 'Please provide a shipping cost and lead time estimate to our destination for the quantity above.',
  },
];

const MESSAGE_LIMIT = 1500;

export default function OrderModal({ isOpen, onClose, product, company }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantityNumber: '',
    unit: inferUnit(product?.priceUnit),
    destination: '',
    paymentTerms: '',
    certifications: [],
    quickMessage: '',
    message: '',
  });
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MESSAGE_LIMIT) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleQuickMessage(e) {
    const value = e.target.value;
    const preset = QUICK_MESSAGES.find((m) => m.value === value);
    setFormData((prev) => ({ ...prev, quickMessage: value, message: preset?.text || prev.message }));
  }

  function toggleCertification(cert) {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const extraLines = [];
      if (formData.destination) extraLines.push(`Destination: ${formData.destination}`);
      if (formData.paymentTerms) extraLines.push(`Preferred Payment Terms: ${formData.paymentTerms}`);
      if (formData.certifications.length > 0) {
        extraLines.push(`Certifications Needed: ${formData.certifications.join(', ')}`);
      }

      const message =
        extraLines.length > 0
          ? `${formData.message}\n\nAdditional Requirements:\n${extraLines.join('\n')}`.trim()
          : formData.message;

      const quantity = [formData.quantityNumber, formData.unit].filter(Boolean).join(' ');

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message,
          items: [{ productTitle: product.title, productSlug: product.slug, quantity }],
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not submit inquiry');
      }

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          quantityNumber: '',
          unit: inferUnit(product?.priceUnit),
          destination: '',
          paymentTerms: '',
          certifications: [],
          quickMessage: '',
          message: '',
        });
        setIsAdditionalOpen(false);
        onClose();
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="bg-brand-navy p-5 flex items-center justify-between text-white sticky top-0 z-10">
          <h3 className="text-lg font-black uppercase tracking-wide">Send Inquiry</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">Inquiry Sent Successfully!</h4>
              <p className="text-sm text-gray-500">
                Our team will review your inquiry for <strong className="text-gray-800">{product.title}</strong> and
                contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 font-sans">
              {/* Product row: thumbnail + title + quantity */}
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-gray-200">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Product</p>
                  <p className="text-sm font-extrabold text-brand-navy line-clamp-2">{product.title}</p>
                </div>
                <div className="shrink-0 flex gap-1.5">
                  <input
                    type="number"
                    min="0"
                    name="quantityNumber"
                    value={formData.quantityNumber}
                    onChange={handleChange}
                    required
                    className="w-20 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center outline-none focus:border-brand-navy bg-white"
                    placeholder="Qty"
                  />
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-lg px-2 py-2 text-xs font-semibold outline-none focus:border-brand-navy bg-white"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Requirements (collapsible) */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setIsAdditionalOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3.5 py-3 bg-slate-50 text-left"
                >
                  <span>
                    <span className="block text-xs font-bold text-gray-800">Additional Requirements</span>
                    <span className="block text-[11px] text-gray-500">
                      Add shipping and certification details for a more accurate quote
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isAdditionalOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isAdditionalOpen && (
                  <div className="p-3.5 space-y-3 border-t border-gray-200">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Destination Port / Country
                      </label>
                      <input
                        type="text"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                        placeholder="e.g. Port of Karachi, Pakistan"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Preferred Payment Terms
                      </label>
                      <select
                        name="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy bg-white"
                      >
                        <option value="">Select (optional)</option>
                        {PAYMENT_TERMS.map((term) => (
                          <option key={term} value={term}>
                            {term}
                          </option>
                        ))}
                      </select>
                    </div>

                    {company?.certifications?.length > 0 && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                          Certifications Needed
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {company.certifications.map((cert) => (
                            <label
                              key={cert.name}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                                formData.certifications.includes(cert.name)
                                  ? 'bg-brand-navy text-white border-brand-navy'
                                  : 'bg-white text-gray-600 border-gray-300 hover:border-brand-navy'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.certifications.includes(cert.name)}
                                onChange={() => toggleCertification(cert.name)}
                                className="hidden"
                              />
                              {cert.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Full Name + Email */}
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
                    placeholder="Please enter your business email address"
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

              {/* Quick message + free-text message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">Message</label>
                  <select
                    value={formData.quickMessage}
                    onChange={handleQuickMessage}
                    className="text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-brand-navy bg-white"
                  >
                    {QUICK_MESSAGES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy resize-none"
                  placeholder="Enter product details such as color, size, materials and other specific requirements."
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-cta hover:bg-brand-cta-hover text-white font-extrabold text-sm py-3.5 rounded-lg uppercase tracking-widest transition-colors mt-2 disabled:opacity-70 flex justify-center items-center"
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
