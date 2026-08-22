'use client';

import { useEffect, useState } from 'react';
import TagListEditor from '@/components/admin/TagListEditor';
import KeyValueListEditor from '@/components/admin/KeyValueListEditor';
import CertificationsEditor from '@/components/admin/CertificationsEditor';

const TABS = [
  { key: 'profile', label: 'Company Profile' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setForm(data);
        setLoading(false);
      });
  }, []);

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setSaving(false);

    if (!res.ok) {
      setError('Could not save settings');
      return;
    }
    setSaved(true);
  }

  if (loading || !form) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-black text-gray-900 mb-1">Company Settings</h1>
      <p className="text-sm text-gray-500 mb-6">
        Written once here, shown automatically on every product page — no need to repeat it per product.
      </p>

      <form onSubmit={handleSubmit} className="max-w-2xl pb-16">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-3 text-xs font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? 'border-brand-navy text-brand-navy'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* Company Profile */}
          {activeTab === 'profile' && (
            <>
              <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Company</h2>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => set('companyName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => set('country', e.target.value)}
                      placeholder="e.g. United Kingdom"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Year Established
                    </label>
                    <input
                      type="text"
                      value={form.yearEstablished}
                      onChange={(e) => set('yearEstablished', e.target.value)}
                      placeholder="e.g. 2021"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.verified}
                    onChange={(e) => set('verified', e.target.checked)}
                    className="w-4 h-4 accent-brand-navy"
                  />
                  Show "Verified" badge
                </label>

                {form.verified && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Verified Label
                    </label>
                    <input
                      type="text"
                      value={form.verifiedLabel}
                      onChange={(e) => set('verifiedLabel', e.target.value)}
                      placeholder="e.g. 1 Year Verified"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Response Time
                  </label>
                  <input
                    type="text"
                    value={form.responseTime}
                    onChange={(e) => set('responseTime', e.target.value)}
                    placeholder="e.g. Within 24 hours"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                  />
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mt-6">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Trading Profile</h2>
                <TagListEditor
                  label="Business Types"
                  placeholder="e.g. Wholesaler"
                  values={form.businessTypes || []}
                  onChange={(v) => set('businessTypes', v)}
                />
                <TagListEditor
                  label="Main Products"
                  placeholder="e.g. Beer, Wine, Spirits"
                  values={form.mainProducts || []}
                  onChange={(v) => set('mainProducts', v)}
                />
                <TagListEditor
                  label="Export Markets"
                  placeholder="e.g. Western Europe"
                  values={form.exportMarkets || []}
                  onChange={(v) => set('exportMarkets', v)}
                />
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    On-time Delivery Rate
                  </label>
                  <input
                    type="text"
                    value={form.onTimeDelivery}
                    onChange={(e) => set('onTimeDelivery', e.target.value)}
                    placeholder="e.g. 98.6%"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                  />
                </div>
              </section>

              <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 mt-6">
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Contact</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+1 (807) 808-8990"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      WhatsApp (digits only)
                    </label>
                    <input
                      type="text"
                      value={form.whatsapp}
                      onChange={(e) => set('whatsapp', e.target.value.replace(/[^\d]/g, ''))}
                      placeholder="18078088990"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                  />
                </div>
              </section>
            </>
          )}

          {/* Certifications */}
          {activeTab === 'certifications' && (
            <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Certifications</h2>
              <p className="text-xs text-gray-500">
                Shown on every product page's Certificates tab, with an optional logo per certification.
              </p>
              <CertificationsEditor
                certifications={form.certifications || []}
                onChange={(v) => set('certifications', v)}
              />
            </section>
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Shipping Information</h2>
              <p className="text-xs text-gray-500">
                Rows shown on every product page's "Shipping & Payment" tab, alongside that product's own lead time
                and minimum order.
              </p>
              <KeyValueListEditor
                rows={form.shippingInfo || []}
                onChange={(v) => set('shippingInfo', v)}
                labelPlaceholder="Label (e.g. FOB Port)"
                valuePlaceholder="Value (e.g. Port of Montreal, Canada)"
              />
            </section>
          )}

          {/* Payment */}
          {activeTab === 'payment' && (
            <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Payment Terms</h2>
              <p className="text-xs text-gray-500">Rows shown on every product page's "Shipping & Payment" tab.</p>
              <KeyValueListEditor
                rows={form.paymentInfo || []}
                onChange={(v) => set('paymentInfo', v)}
                labelPlaceholder="Label (e.g. Accepted Methods)"
                valuePlaceholder="Value (e.g. T/T, L/C, Western Union)"
              />
            </section>
          )}
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-6">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && <span className="text-xs font-bold text-brand-green">Saved</span>}
        </div>
      </form>
    </div>
  );
}
