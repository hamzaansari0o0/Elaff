import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Product from '@/models/Product';

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
