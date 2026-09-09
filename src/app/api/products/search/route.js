import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { formatPrice } from '@/lib/formatPrice';
import { fuzzyScore } from '@/lib/fuzzyMatch';

const SUGGESTION_LIMIT = 5;
const FIELDS = 'title slug images price priceUnit category';

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toSuggestion(p) {
  return {
    id: p._id.toString(),
    title: p.title,
    slug: p.slug,
    image: p.images?.[0] || '',
    category: p.category || '',
    price: formatPrice(p.price, p.priceUnit),
  };
}

// Live search-as-you-type suggestions for the navbar search bar. Public route
// (no auth) — only ever returns published products. Case-insensitive by
// nature of the regex 'i' flag. Title-prefix matches ("mi" -> "Milk...") are
// ranked above matches found elsewhere in the title/category/SKU, the way
// most storefront search bars work, so the most relevant results land first
// in a short list rather than whatever was added to the catalog most recently.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();

  if (q.length < 2) {
    return NextResponse.json({ products: [] });
  }

  await connectDB();
  const safe = escapeRegex(q);
  const prefixRegex = new RegExp('^' + safe, 'i');
  const containsRegex = new RegExp(safe, 'i');

  const prefixMatches = await Product.find({ status: 'active', title: prefixRegex })
    .select(FIELDS)
    .sort({ createdAt: -1 })
    .limit(SUGGESTION_LIMIT)
    .lean();

  let results = prefixMatches;

  if (results.length < SUGGESTION_LIMIT) {
    const remaining = SUGGESTION_LIMIT - results.length;
    const fallbackMatches = await Product.find({
      status: 'active',
      _id: { $nin: results.map((p) => p._id) },
      $or: [{ title: containsRegex }, { category: containsRegex }, { sku: containsRegex }],
    })
      .select(FIELDS)
      .sort({ createdAt: -1 })
      .limit(remaining)
      .lean();
    results = results.concat(fallbackMatches);
  }

  // Typo tolerance: only runs when the fast exact/prefix/contains search
  // above didn't fill the list — e.g. "agricultureal" finds nothing there,
  // but is one edit away from "Agricultural", so this catches it as a
  // fallback instead of scanning the whole catalog on every keystroke.
  // Skipped for 2-char queries, where edit-distance matching is too noisy
  // to mean anything.
  if (results.length < SUGGESTION_LIMIT && q.length >= 3) {
    const remaining = SUGGESTION_LIMIT - results.length;
    const candidates = await Product.find({
      status: 'active',
      _id: { $nin: results.map((p) => p._id) },
    })
      .select(FIELDS)
      .lean();

    const fuzzyMatches = candidates
      .map((p) => ({ product: p, score: fuzzyScore(q, `${p.title} ${p.category}`) }))
      .filter((c) => c.score < Infinity)
      .sort((a, b) => a.score - b.score)
      .slice(0, remaining)
      .map((c) => c.product);

    results = results.concat(fuzzyMatches);
  }

  return NextResponse.json({ products: results.map(toSuggestion) });
}
