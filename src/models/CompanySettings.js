import mongoose from 'mongoose';

const KeyValueSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const CertificationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, default: '' }, // optional logo/badge, uploaded via Cloudinary
  },
  { _id: false }
);

// Singleton — a single document holds the trust/company info shown on every
// product page (supplier card, Company Profile / Certificates / Shipping & Payment
// tabs), since this storefront represents one company rather than a multi-vendor
// marketplace. Written once in admin, reused across every product page.
const CompanySettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Elaff Trade Co.' },
    verified: { type: Boolean, default: true },
    verifiedLabel: { type: String, default: '1 Year Verified' },
    country: { type: String, default: '' },
    yearEstablished: { type: String, default: '' },
    businessTypes: [{ type: String }], // e.g. Wholesaler, Distributor, Exporter, Trading Company
    mainProducts: [{ type: String }], // e.g. Beer, Wine, Spirits, Soft Drinks
    exportMarkets: [{ type: String }], // e.g. Western Europe, North America
    responseTime: { type: String, default: '' }, // e.g. "≤ 24 hours"
    onTimeDelivery: { type: String, default: '' }, // e.g. "98.6%"
    phone: { type: String, default: '' },
    whatsapp: { type: String, default: '' }, // digits only, e.g. 18078088990
    email: { type: String, default: '' },
    certifications: [CertificationSchema], // company-wide certifications shown on every product page
    shippingInfo: [KeyValueSchema], // e.g. FOB Port, Packaging, Shipping Method — admin-defined rows
    paymentInfo: [KeyValueSchema], // e.g. Accepted Methods, Minimum Deposit — admin-defined rows
  },
  { timestamps: true }
);

export default mongoose.models.CompanySettings || mongoose.model('CompanySettings', CompanySettingsSchema);
