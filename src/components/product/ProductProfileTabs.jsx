'use client';

import { useState } from 'react';
import { MessageCircle, Mail, Phone, ShieldCheck, Package } from 'lucide-react';

const TABS = [
  { key: 'details', label: 'Product Details' },
  { key: 'company', label: 'Company Profile' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'shipping', label: 'Shipping & Payment' },
];

function Row({ label, value }) {
  if (!value) return null;
  return (
    <tr className="odd:bg-slate-50 even:bg-white">
      <th className="py-3 px-4 font-bold text-gray-700 w-1/2 border-r border-gray-200 align-top">{label}</th>
      <td className="py-3 px-4 text-gray-600 font-medium align-top">{value}</td>
    </tr>
  );
}

function DataTable({ children }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full text-left text-sm">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyNote({ children }) {
  return <p className="text-sm text-gray-400 italic">{children}</p>;
}

function SectionLabel({ children }) {
  return <h3 className="font-bold text-gray-900 uppercase text-xs tracking-widest mb-3">{children}</h3>;
}

function specValue(specifications, keyword) {
  return specifications?.find((s) => s.label.toLowerCase().includes(keyword))?.value;
}

export default function ProductProfileTabs({ product, company }) {
  const [activeTab, setActiveTab] = useState('details');

  const chatHref = company?.whatsapp
    ? `https://wa.me/${company.whatsapp}`
    : company?.email
    ? `mailto:${company.email}`
    : company?.phone
    ? `tel:${company.phone}`
    : null;

  const packagingValue = specValue(product.specifications, 'packag');
  const lifestyleImage = product.images?.[1] || product.images?.[0];

  return (
    <div>
      {/* Flat underline tabs */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200">
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 md:px-5 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wide border-b-2 -mb-px transition-colors ${
                active
                  ? 'border-brand-amber text-brand-navy'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-b-2xl border border-t-0 border-gray-200 shadow-sm p-6 md:p-10">
        {/* ---------- PRODUCT DETAILS ---------- */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <SectionLabel>Key Specifications</SectionLabel>
              {product.fullDescription && (
                <div
                  className="text-sm text-gray-600 leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                />
              )}
              {product.specifications?.length > 0 ? (
                <DataTable>
                  {product.specifications.map((s, i) => (
                    <Row key={i} label={s.label} value={s.value} />
                  ))}
                </DataTable>
              ) : (
                <EmptyNote>No specifications listed yet.</EmptyNote>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-brand-amber" />
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">Available Packaging</p>
                </div>
                <p className="text-sm text-gray-600">{packagingValue || 'Contact us for packaging options.'}</p>
              </div>

              <div className="bg-slate-50 border border-gray-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4 text-brand-amber" />
                  <p className="text-xs font-bold text-gray-800 uppercase tracking-wide">Certifications</p>
                </div>
                {company?.certifications?.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {company.certifications.map((c, i) => (
                      <span
                        key={i}
                        className="bg-white border border-gray-200 text-gray-700 text-xs font-bold px-2.5 py-1.5 rounded-md"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">Not listed yet.</p>
                )}
              </div>
            </div>

            {lifestyleImage && (
              <div className="lg:col-span-1">
                <div className="relative rounded-xl overflow-hidden h-full min-h-[220px] bg-gray-100">
                  <img src={lifestyleImage} alt={product.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-brand-navy/0 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {product.category && (
                      <span className="text-[10px] font-extrabold text-brand-cyan uppercase tracking-widest block mb-1">
                        {product.category}
                      </span>
                    )}
                    <p className="font-fraunces text-lg font-black text-white leading-snug">{product.title}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------- COMPANY PROFILE ---------- */}
        {activeTab === 'company' && (
          <div className="space-y-8">
            <div>
              <SectionLabel>Basic Information</SectionLabel>
              <DataTable>
                <Row label="Country / Region" value={company?.country} />
                <Row label="Year Established" value={company?.yearEstablished} />
                <Row
                  label="Business Type"
                  value={company?.businessTypes?.length > 0 ? company.businessTypes.join(', ') : undefined}
                />
                <Row
                  label="Main Products"
                  value={company?.mainProducts?.length > 0 ? company.mainProducts.join(', ') : undefined}
                />
                <Row label="Verification" value={company?.verified ? company.verifiedLabel || 'Verified' : undefined} />
              </DataTable>
            </div>

            <div>
              <SectionLabel>Trading Capabilities</SectionLabel>
              <DataTable>
                <Row label="Response Time" value={company?.responseTime} />
                <Row label="On-time Delivery" value={company?.onTimeDelivery} />
                <Row
                  label="Export Markets"
                  value={company?.exportMarkets?.length > 0 ? company.exportMarkets.join(', ') : undefined}
                />
              </DataTable>
            </div>
          </div>
        )}

        {/* ---------- CERTIFICATES ---------- */}
        {activeTab === 'certificates' && (
          <div>
            <SectionLabel>Certifications</SectionLabel>
            {company?.certifications?.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {company.certifications.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 bg-slate-50 border border-gray-200 rounded-xl px-4 py-3"
                  >
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-8 h-8 object-contain shrink-0" />
                    ) : (
                      <ShieldCheck className="w-5 h-5 text-brand-green shrink-0" />
                    )}
                    <span className="text-sm font-bold text-gray-800">{c.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyNote>No certifications listed yet — contact us for compliance documents.</EmptyNote>
            )}
          </div>
        )}

        {/* ---------- SHIPPING & PAYMENT ---------- */}
        {activeTab === 'shipping' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <SectionLabel>Shipping Information</SectionLabel>
              <DataTable>
                <Row label="Lead Time" value={product.leadTime || 'Contact us'} />
                <Row label="Minimum Order" value={product.moq || 'Contact us'} />
                {company?.shippingInfo?.map((row, i) => (
                  <Row key={i} label={row.label} value={row.value} />
                ))}
              </DataTable>
            </div>

            <div>
              <SectionLabel>Main Export Markets</SectionLabel>
              {company?.exportMarkets?.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {company.exportMarkets.map((m, i) => (
                    <span key={i} className="bg-brand-cyan/10 text-brand-cyan text-xs font-semibold px-2.5 py-1.5 rounded-md">
                      {m}
                    </span>
                  ))}
                </div>
              ) : (
                <EmptyNote>Contact us for current shipping coverage.</EmptyNote>
              )}
            </div>

            <div>
              <SectionLabel>Payment Terms</SectionLabel>
              {company?.paymentInfo?.length > 0 ? (
                <DataTable>
                  {company.paymentInfo.map((row, i) => (
                    <Row key={i} label={row.label} value={row.value} />
                  ))}
                </DataTable>
              ) : (
                <EmptyNote>Contact us for payment terms.</EmptyNote>
              )}
            </div>
          </div>
        )}

        {chatHref && (
          <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
            <a
              href={chatHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navy-hover text-white text-xs font-bold px-5 py-3 rounded-xl uppercase tracking-wide transition-colors"
            >
              {company?.whatsapp ? <MessageCircle className="w-4 h-4" /> : company?.email ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
              Contact Supplier
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
