'use client';

import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import RevealText from '@/components/ui/RevealText';

const MESSAGE_LIMIT = 1000;

const MESSAGE_TEMPLATES = [
  {
    label: 'Product not listed',
    text: "The product I'm looking for doesn't seem to be listed on your website. Could you confirm if it's available?",
  },
  {
    label: 'Policy question',
    text: 'I have a question about your company policies (returns, minimum order quantity, etc.).',
  },
  {
    label: 'Shipping question',
    text: "I'd like to know more about your shipping options, costs, and delivery timelines.",
  },
  {
    label: 'No email reply',
    text: "I sent an email previously but haven't received a reply yet. Following up on my inquiry.",
  },
  {
    label: 'No WhatsApp reply',
    text: "I sent a message on WhatsApp but haven't received a response yet.",
  },
  {
    label: 'Bulk / wholesale quote',
    text: "I'm interested in placing a bulk order and would like a wholesale price quote.",
  },
];

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MESSAGE_LIMIT) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!agreed) {
      setError('Please agree to the terms and conditions to send your message.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not send your message');
      }

      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setAgreed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10 flex flex-col items-center justify-center text-center py-16">
        <div className="w-14 h-14 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center mb-4">
          <Check className="w-7 h-7" />
        </div>
        <p className="text-sm font-bold text-gray-800 mb-1">Message sent</p>
        <p className="text-xs text-gray-500 max-w-xs">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="mt-6 text-xs font-bold text-brand-navy hover:underline uppercase tracking-wide"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-10">
      <RevealText as="h2" className="font-fraunces text-xl md:text-2xl font-black text-gray-900 uppercase tracking-wide mb-1.5 block">
        Contact Us
      </RevealText>
      <p className="text-sm text-gray-500 mb-6">
        Have a question or an order in mind? Send us a message below.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Name *</label>
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
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Email *</label>
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
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
            Message *
          </label>

          <div className="flex flex-wrap gap-1.5 mb-2">
            {MESSAGE_TEMPLATES.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, message: template.text }))}
                className="text-[11px] font-semibold text-gray-600 bg-slate-50 hover:bg-slate-100 hover:text-brand-navy border border-gray-200 rounded-full px-3 py-1.5 transition-colors"
              >
                {template.label}
              </button>
            ))}
          </div>

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy resize-none"
            placeholder="Tell us how we can help..."
          />
          <p className="text-right text-[11px] text-gray-400 mt-1">
            {formData.message.length} / {MESSAGE_LIMIT}
          </p>
        </div>

        <label className="flex items-start gap-2.5 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-brand-navy shrink-0"
          />
          <span>
            I agree to the{' '}
            <a href="/terms" className="text-brand-navy font-semibold hover:underline">
              terms and conditions
            </a>
            .
          </span>
        </label>

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-60 text-white font-extrabold text-xs md:text-sm py-3.5 px-6 rounded-xl uppercase tracking-widest transition-colors shadow-lg"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
