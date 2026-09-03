import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Product from '@/models/Product';
import { deleteCloudinaryImages } from '@/lib/cloudinary';

// Product images live in the main gallery and can also be embedded in
// Company Profile page sections (imageText/gallery blocks) — both need
// cleaning up or a deleted product still leaves orphaned Cloudinary assets.
function collectImageUrls(product) {
  const urls = [...(product.images || [])];
  for (const section of product.pageSections || []) {
    if (section.image) urls.push(section.image);
    if (Array.isArray(section.images)) urls.push(...section.images);
  }
  return urls;
}

export async function GET(request, { params }) {
  await connectDB();
  const { id } = await params;
  const product = await Product.findById(id).populate('collections', 'title slug');
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const body = await request.json();

  try {
    const product = await Product.findByIdAndUpdate(id, body, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return NextResponse.json({ error: 'A product with this slug already exists' }, { status: 409 });
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
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  await deleteCloudinaryImages(collectImageUrls(product));
  return NextResponse.json({ success: true });
}
