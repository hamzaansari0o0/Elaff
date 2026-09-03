import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/slugify';
import Product from '@/models/Product';
import Collection from '@/models/Collection';
import cloudinary, { productImageFolder } from '@/lib/cloudinary';

// Bulk imports fetch+re-host external images per row, which can be slow —
// give this route more headroom than the default function timeout.
export const maxDuration = 60;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Sheet prices arrive as more than plain numbers — "$850", "1,200.50", or a
// range like "US $850 - $900 / Ton" — so pull out the first numeric token
// (the low end, for a range) instead of failing on anything but a bare number.
function toNumberOrNull(value) {
  if (value === '' || value == null) return null;
  const match = String(value).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

async function resolveCollectionIds(names = []) {
  const ids = [];
  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) continue;

    let collection = await Collection.findOne({ title: new RegExp(`^${escapeRegex(name)}$`, 'i') });
    if (!collection) {
      try {
        collection = await Collection.create({ title: name, slug: slugify(name) });
      } catch (err) {
        if (err.code === 11000) {
          collection = await Collection.findOne({ slug: slugify(name) });
        } else {
          throw err;
        }
      }
    }
    if (collection) ids.push(collection._id);
  }
  return ids;
}

// Re-hosts external image URLs on Cloudinary so they don't depend on a
// third-party site staying up; leaves our own Cloudinary URLs untouched.
// Rows can carry several images (main + additional columns merged), so these
// run in parallel rather than one at a time. Filed under the row's own
// collection folder (e.g. elaff-products/frozen-food) when it has one.
async function resolveImages(urls = [], folder = productImageFolder()) {
  const list = urls.filter(Boolean);
  const settled = await Promise.allSettled(
    list.map((url) =>
      url.includes('res.cloudinary.com')
        ? Promise.resolve(url)
        : cloudinary.uploader.upload(url, { folder }).then((r) => r.secure_url)
    )
  );

  const resolved = [];
  const warnings = [];
  settled.forEach((outcome, i) => {
    if (outcome.status === 'fulfilled') resolved.push(outcome.value);
    else warnings.push(`Could not fetch image: ${list[i]}`);
  });
  return { resolved, warnings };
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { rows, updateExisting } = await request.json();

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'rows must be a non-empty array' }, { status: 400 });
  }

  const results = [];

  for (const row of rows) {
    const label = row.title || row.slug || '(untitled row)';
    try {
      if (!row.title) {
        results.push({ title: label, status: 'error', message: 'Missing title' });
        continue;
      }

      const slug = slugify(row.slug || row.title);
      if (!slug) {
        results.push({ title: label, status: 'error', message: 'Could not derive a slug from title' });
        continue;
      }

      const existing = await Product.findOne({ slug });
      if (existing && !updateExisting) {
        results.push({ title: label, status: 'skipped', message: `Slug "${slug}" already exists` });
        continue;
      }

      const collections = await resolveCollectionIds(row.collectionNames);
      const imageFolder = productImageFolder(row.collectionNames?.[0]);
      const { resolved: images, warnings: imageWarnings } = await resolveImages(row.images, imageFolder);

      if (images.length === 0 && !existing) {
        results.push({ title: label, status: 'error', message: 'No usable images (all image URLs failed to fetch)' });
        continue;
      }

      const doc = {
        title: row.title,
        slug,
        sku: row.sku || '',
        category: row.category || '',
        collections,
        price: toNumberOrNull(row.price),
        priceUnit: row.priceUnit || '',
        oldPrice: toNumberOrNull(row.oldPrice),
        moq: row.moq || '',
        leadTime: row.leadTime || '',
        badge: row.badge || '',
        tags: row.tags || [],
        status: row.status || 'active',
        featured: Boolean(row.featured),
        shortDescription: row.shortDescription || '',
        fullDescription: row.fullDescription || '',
        specifications: row.specifications || [],
        shippingInfo: row.shippingInfo || [],
      };
      if (images.length > 0) doc.images = images;

      if (existing) {
        await Product.findByIdAndUpdate(existing._id, doc, { runValidators: true });
        results.push({ title: label, status: 'updated', message: imageWarnings.join('; ') || undefined });
      } else {
        await Product.create(doc);
        results.push({ title: label, status: 'created', message: imageWarnings.join('; ') || undefined });
      }
    } catch (err) {
      results.push({
        title: label,
        status: 'error',
        message: err.code === 11000 ? 'A product with this slug already exists' : err.message,
      });
    }
  }

  return NextResponse.json({ results });
}
