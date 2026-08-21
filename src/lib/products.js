// Data Fetching Helpers — reads live catalog data from MongoDB (managed via /admin).

import { connectDB } from './mongodb';
import Product from '@/models/Product';
import Collection from '@/models/Collection';

// Strip Mongoose-specific types (ObjectId, Date) into plain JSON, and expose `id`
// alongside `_id` so components can use either.
function serialize(doc) {
  const obj = JSON.parse(JSON.stringify(doc));
  obj.id = obj._id;
  return obj;
}

function formatPrice(amount, unit) {
  if (amount == null) return undefined;
  return `$${Number(amount).toFixed(2)}${unit || ''}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Shapes a full product document into the compact card format ProductCard expects.
export function toCardShape(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    category: (p.category || '').toUpperCase(),
    price: formatPrice(p.price, p.priceUnit),
    priceValue: typeof p.price === 'number' ? p.price : null,
    oldPrice: formatPrice(p.oldPrice, ''),
    image: p.images?.[0] || '',
    badge: p.badge || undefined,
    sku: p.sku || '',
  };
}

// --- PRODUCT HELPERS ---
export async function getAllProducts() {
  await connectDB();
  const products = await Product.find({ status: 'active' })
    .populate('collections', 'title slug')
    .sort({ createdAt: -1 })
    .lean();
  return products.map(serialize);
}

export async function getProductBySlug(slug) {
  await connectDB();
  const product = await Product.findOne({ slug }).populate('collections', 'title slug').lean();
  return product ? serialize(product) : null;
}

export async function getFeaturedProducts() {
  await connectDB();
  const products = await Product.find({ featured: true, status: 'active' }).lean();
  return products.map(serialize);
}

// Homepage sections (Latest On Sale, Weekly Featured, Bestsellers) are driven by tags
// set in the admin product form, rather than separate hardcoded lists.
export async function getProductsByTag(tag) {
  await connectDB();
  const products = await Product.find({ tags: tag, status: 'active' }).sort({ createdAt: -1 }).lean();
  return products.map(serialize);
}

export async function searchProducts(query) {
  await connectDB();
  const regex = new RegExp(escapeRegex(query.trim()), 'i');
  const products = await Product.find({
    status: 'active',
    $or: [{ title: regex }, { category: regex }, { shortDescription: regex }, { sku: regex }],
  })
    .sort({ createdAt: -1 })
    .lean();
  return products.map(serialize);
}

// --- COLLECTION HELPERS ---
export async function getAllCollections() {
  await connectDB();
  const collections = await Collection.find().sort({ title: 1 }).lean();
  return collections.map(serialize);
}

export async function getCollectionBySlug(slug) {
  await connectDB();
  const collection = await Collection.findOne({ slug }).lean();
  return collection ? serialize(collection) : null;
}

export async function getProductsByCollection(collectionSlug) {
  await connectDB();
  const collection = await Collection.findOne({ slug: collectionSlug }).lean();
  if (!collection) return [];
  const products = await Product.find({ collections: collection._id, status: 'active' })
    .sort({ createdAt: -1 })
    .lean();
  return products.map(serialize);
}

// Circular category cards on the homepage. Falls back to a sample product's image
// when a collection has no cover image set in the admin panel yet.
export async function getCategoryCards() {
  await connectDB();
  const collections = await Collection.find().sort({ title: 1 }).lean();

  return Promise.all(
    collections.map(async (c) => {
      const count = await Product.countDocuments({ collections: c._id, status: 'active' });
      let image = c.image;
      if (!image) {
        const sample = await Product.findOne({ collections: c._id }).select('images').lean();
        image = sample?.images?.[0] || '';
      }
      return {
        title: c.title.toUpperCase(),
        slug: c.slug,
        image,
        count: `${count} PRODUCTS`,
      };
    })
  );
}
