import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Collection from '@/models/Collection';
import Product from '@/models/Product';
import { COLLECTIONS, PRODUCTS } from '@/data/mockData';

// mockData prices are display strings like "$205.00 / ton" — split into a numeric
// price plus the trailing unit so they fit the Product schema's Number field.
function parsePrice(raw) {
  if (raw == null) return { amount: null, unit: '' };
  const [amountPart, ...rest] = String(raw).split('/');
  const amount = Number(amountPart.replace(/[^0-9.]/g, ''));
  const unit = rest.length ? `/${rest.join('/')}`.trim() : '';
  return { amount: Number.isNaN(amount) ? null : amount, unit: unit ? ` ${unit}` : '' };
}

// Cover image shown on the homepage category cards until an admin uploads a custom one.
const COLLECTION_COVER_IMAGES = {
  'frozen-food': 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=300&auto=format&fit=crop',
  confectionery: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=300&auto=format&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?q=80&w=300&auto=format&fit=crop',
  agricultural: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=300&auto=format&fit=crop',
  'cooking-oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop',
  'tea-coffee': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
};

// One-time (re-runnable) seed: upserts the starter catalog from mockData.js into MongoDB.
// Safe to call again — matches by slug instead of inserting duplicates.
export async function POST() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const slugToId = {};
  for (const c of COLLECTIONS) {
    const doc = await Collection.findOneAndUpdate(
      { slug: c.slug },
      { title: c.title, slug: c.slug, description: c.description, image: COLLECTION_COVER_IMAGES[c.slug] || '' },
      { upsert: true, returnDocument: 'after' }
    );
    slugToId[c.slug] = doc._id;
  }

  let productCount = 0;
  for (const p of PRODUCTS) {
    const tags = Object.keys(p.tags || {}).filter((k) => p.tags[k]);
    const collections = p.collectionSlug && slugToId[p.collectionSlug] ? [slugToId[p.collectionSlug]] : [];
    const price = parsePrice(p.price);
    const oldPrice = parsePrice(p.oldPrice);

    await Product.findOneAndUpdate(
      { slug: p.slug },
      {
        title: p.title,
        slug: p.slug,
        sku: p.sku || '',
        category: p.category || '',
        collections,
        price: price.amount,
        priceUnit: price.unit,
        oldPrice: oldPrice.amount,
        badge: p.badge || '',
        tags,
        status: 'active',
        featured: Boolean(p.featured),
        shortDescription: p.shortDescription || '',
        fullDescription: p.fullDescription || '',
        specifications: p.specifications || [],
        images: p.images || [],
      },
      { upsert: true, returnDocument: 'after' }
    );
    productCount += 1;
  }

  return NextResponse.json({
    success: true,
    collections: COLLECTIONS.length,
    products: productCount,
  });
}
