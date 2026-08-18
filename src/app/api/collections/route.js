import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Collection from '@/models/Collection';

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
