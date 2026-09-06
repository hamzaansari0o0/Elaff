import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Collection from '@/models/Collection';
import Product from '@/models/Product';

export async function GET() {
  await connectDB();
  const collections = await Collection.find().sort({ createdAt: -1 });
  return NextResponse.json(collections);
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
    const collection = await Collection.create({
      title: body.title,
      slug: body.slug,
      description: body.description || '',
      image: body.image || '',
    });
    return NextResponse.json(collection, { status: 201 });
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A collection with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Bulk delete: body is { ids: [...] }. Same "still has products assigned"
// guard as the single-collection DELETE route, applied per collection so one
// blocked collection doesn't stop the rest of the selection from deleting.
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

  const collections = await Collection.find({ _id: { $in: ids } });
  const deletableIds = [];
  const blocked = [];

  for (const collection of collections) {
    const inUse = await Product.countDocuments({ collections: collection._id });
    if (inUse > 0) {
      blocked.push({ id: collection._id.toString(), title: collection.title, productCount: inUse });
    } else {
      deletableIds.push(collection._id);
    }
  }

  if (deletableIds.length > 0) {
    await Collection.deleteMany({ _id: { $in: deletableIds } });
  }

  return NextResponse.json({ deletedCount: deletableIds.length, blocked });
}
