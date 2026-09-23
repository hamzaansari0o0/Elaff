import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Product from '@/models/Product';
import { escapeRegex } from '@/lib/products';
import { deleteCloudinaryImages, collectProductImageUrls } from '@/lib/cloudinary';

// Matches the shop page's page size — the admin product list is the only
// caller of this unfiltered/paginated shape, so both can move together.
const ADMIN_PAGE_SIZE = 10;

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('collection');
  const status = searchParams.get('status');
  const tag = searchParams.get('tag');
  const search = searchParams.get('search');
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);

  const filter = {};
  if (collectionId) filter.collections = collectionId;
  if (status) filter.status = status;
  if (tag) filter.tags = tag;
  if (search) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: regex }, { sku: regex }, { category: regex }];
  }

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .populate('collections', 'title slug')
      .sort({ createdAt: -1 })
      .skip((page - 1) * ADMIN_PAGE_SIZE)
      .limit(ADMIN_PAGE_SIZE),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  });
}

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();

  if (!body.title || !body.slug) {
    return NextResponse.json({ error: 'title and slug are required' }, { status: 400 });
  }

  try {
    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Bulk delete: body is { ids: [...] }. Used by the admin product list's
// select-and-delete-multiple action.
export async function DELETE(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  const ids = Array.isArray(body.ids) ? body.ids : [];

  if (ids.length === 0) {
    return NextResponse.json({ error: 'ids array is required' }, { status: 400 });
  }

  const products = await Product.find({ _id: { $in: ids } });
  await Product.deleteMany({ _id: { $in: ids } });
  await deleteCloudinaryImages(products.flatMap(collectProductImageUrls));

  return NextResponse.json({ deletedCount: products.length });
}
