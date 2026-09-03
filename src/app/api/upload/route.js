import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import cloudinary, { productImageFolder, publicIdFromUrl } from '@/lib/cloudinary';

export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const collectionName = formData.get('collection');

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const folder = productImageFolder(collectionName);

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, uploadResult) => {
        if (error) reject(error);
        else resolve(uploadResult);
      }
    );
    stream.end(buffer);
  });

  return NextResponse.json({ url: result.secure_url });
}

export async function DELETE(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const publicId = publicIdFromUrl(url);
  if (!publicId) {
    // Not one of our Cloudinary URLs (e.g. a leftover external/placeholder image) — nothing to delete.
    return NextResponse.json({ success: true, skipped: true });
  }

  await cloudinary.uploader.destroy(publicId);
  return NextResponse.json({ success: true });
}
