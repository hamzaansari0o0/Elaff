import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Product from '@/models/Product';
import { deleteCloudinaryImages, collectProductImageUrls } from '@/lib/cloudinary';

export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('collection');
  const status = searchParams.get('status');
  const tag = searchParams.get('tag');

  const filter = {};
  if (collectionId) filter.collections = collectionId;
  if (status) filter.status = status;
  if (tag) filter.tags = tag;

  const products = await Product.find(filter)
    .populate('collections', 'title slug')
    .sort({ createdAt: -1 });

  return NextResponse.json(products);
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
