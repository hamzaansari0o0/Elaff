import mongoose from 'mongoose';

const SpecificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

// Admin-configurable content blocks for the product page's "Company Profile" area
// (e.g. Company Overview, Production Capacity, Quality Control from a supplier listing —
// modeled as reusable block types rather than fixed fields, so admins can add/remove/reorder
// freely per product without a schema change, similar to Shopify metafields.
const PageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['infoTable', 'richText', 'imageText', 'gallery'],
      required: true,
    },
    title: { type: String, default: '' },
    body: { type: String, default: '' }, // richText, imageText
    image: { type: String, default: '' }, // imageText
    images: [{ type: String }], // gallery
    fields: [SpecificationSchema], // infoTable
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, default: '' },
    category: { type: String, default: '' },
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
    price: { type: Number, default: null },
    priceUnit: { type: String, default: '' }, // e.g. "/ ton", leave blank for flat price
    oldPrice: { type: Number, default: null },
    badge: { type: String, default: '' }, // e.g. SALE, HOT, NEW
    tags: [{ type: String }], // e.g. onSale, weeklyFeatured, bestseller
    status: { type: String, enum: ['active', 'draft'], default: 'active' },
    featured: { type: Boolean, default: false },
    shortDescription: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    specifications: [SpecificationSchema],
    images: [{ type: String }],
    pageSections: [PageSectionSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
