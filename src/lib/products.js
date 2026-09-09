// Data Fetching Helpers — reads live catalog data from MongoDB (managed via /admin).

import { connectDB } from './mongodb';
import Product from '@/models/Product';
import Collection from '@/models/Collection';
import { formatPrice } from './formatPrice';

// Strip Mongoose-specific types (ObjectId, Date) into plain JSON, and expose `id`
// alongside `_id` so components can use either.
function serialize(doc) {
  const obj = JSON.parse(JSON.stringify(doc));
  obj.id = obj._id;
  return obj;
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

// Other active products sharing the same first collection, for the product page's "Related Products" carousel.
export async function getRelatedProducts(product, limit = 10) {
  const collectionId = product.collections?.[0]?._id || product.collections?.[0];
  if (!collectionId) return [];

  await connectDB();
  const products = await Product.find({
    collections: collectionId,
    status: 'active',
    _id: { $ne: product.id },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map(serialize);
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

export const SHOP_PAGE_SIZE = 10;

const SHOP_SORTS = {
  featured: { createdAt: -1 },
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  'name-asc': { title: 1 },
};

// Powers the /shop page: same exclusive search > collection > tag > "all
// products" precedence the page always used, plus real server-side sorting
// and pagination (10 per page) instead of loading every matching product.
export async function getShopProducts({ tag, collectionSlug, search, page = 1, sort = 'featured' } = {}) {
  await connectDB();

  const filter = { status: 'active' };
  let collectionDoc = null;

  if (search) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: regex }, { category: regex }, { shortDescription: regex }, { sku: regex }];
  } else if (collectionSlug) {
    collectionDoc = await Collection.findOne({ slug: collectionSlug }).lean();
    // No matching collection -> an id no product can have, so this deliberately
    // resolves to zero results instead of accidentally falling through to "all".
    filter.collections = collectionDoc?._id || '000000000000000000000000';
  } else if (tag) {
    filter.tags = tag;
  }

  // The count and the page of results don't depend on each other, so run
  // them as two concurrent round trips instead of one after the other.
  // Page can't be clamped to totalPages until the count comes back, so this
  // fetches one page too many/few worth of skip in the rare case a stale
  // `page` is past the end — corrected below by re-querying only when that
  // actually happens, which is the uncommon path (e.g. a bookmarked page
  // link after items were removed), not the common one.
  const requestedPage = Math.max(1, parseInt(page, 10) || 1);
  const [total, firstAttempt] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .populate('collections', 'title slug')
      .sort(SHOP_SORTS[sort] || SHOP_SORTS.featured)
      .skip((requestedPage - 1) * SHOP_PAGE_SIZE)
      .limit(SHOP_PAGE_SIZE)
      .lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / SHOP_PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);

  const products =
    safePage === requestedPage
      ? firstAttempt
      : await Product.find(filter)
          .populate('collections', 'title slug')
          .sort(SHOP_SORTS[sort] || SHOP_SORTS.featured)
          .skip((safePage - 1) * SHOP_PAGE_SIZE)
          .limit(SHOP_PAGE_SIZE)
          .lean();

  return {
    products: products.map(serialize),
    total,
    totalPages,
    page: safePage,
    collection: collectionDoc ? serialize(collectionDoc) : null,
  };
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
//
// One aggregation across all products, instead of a countDocuments() +
// findOne() per collection (2N queries that scaled linearly with the
// catalog's category count) — a single pass that groups by collection.
export async function getCategoryCards() {
  await connectDB();
  const [collections, stats] = await Promise.all([
    Collection.find().sort({ title: 1 }).lean(),
    Product.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$collections' },
      { $group: { _id: '$collections', count: { $sum: 1 }, sampleImage: { $first: '$images' } } },
    ]),
  ]);

  const statsById = new Map(stats.map((s) => [s._id.toString(), s]));

  return collections.map((c) => {
    const stat = statsById.get(c._id.toString());
    return {
      title: c.title.toUpperCase(),
      slug: c.slug,
      image: c.image || stat?.sampleImage?.[0] || '',
      count: `${stat?.count || 0} PRODUCTS`,
    };
  });
}

// Homepage "shop by category" mini-lists — a few real products per collection,
// so it only ever shows what's actually been added in admin (no placeholder items).
export async function getMiniCategoryLists(maxCategories = 4, productsPerCategory = 4) {
  await connectDB();
  const collections = await Collection.find().sort({ title: 1 }).lean();

  const panels = await Promise.all(
    collections.map(async (c) => {
      const products = await Product.find({ collections: c._id, status: 'active' })
        .sort({ createdAt: -1 })
        .limit(productsPerCategory)
        .select('title slug images')
        .lean();

      return {
        title: c.title,
        slug: c.slug,
        items: products.map((p) => ({
          title: p.title,
          slug: p.slug,
          image: p.images?.[0] || '',
        })),
      };
    })
  );

  return panels.filter((p) => p.items.length > 0).slice(0, maxCategories);
}
