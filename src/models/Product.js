import mongoose from 'mongoose';

const SpecificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
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
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
