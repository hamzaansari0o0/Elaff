import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Collection from '@/models/Collection';
import Product from '@/models/Product';

export async function GET(request, { params }) {
  await connectDB();
  const { id } = await params;
  const collection = await Collection.findById(id);
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }
  return NextResponse.json(collection);
}

export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const body = await request.json();

  try {
    const collection = await Collection.findByIdAndUpdate(
      id,
      {
        title: body.title,
        slug: body.slug,
        description: body.description || '',
        image: body.image || '',
      },
      { returnDocument: 'after', runValidators: true }
    );
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json(collection);
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A collection with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;

  const inUse = await Product.countDocuments({ collections: id });
  if (inUse > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${inUse} product(s) still assigned to this collection` },
      { status: 409 }
    );
  }

  const collection = await Collection.findByIdAndDelete(id);
  if (!collection) {
    return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
