import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import cloudinary, { productImageFolder } from '@/lib/cloudinary';

// Signs a direct browser -> Cloudinary upload. Large files (video) need this
// instead of the proxy-through-our-server /api/upload route: Vercel's
// serverless functions hard-cap request bodies at 4.5MB, so any real video
// upload would fail before it even reaches our code. Signing here keeps the
// API secret server-side while letting the actual file bytes go straight to
// Cloudinary, bypassing that limit entirely.
export async function POST(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { collection } = await request.json().catch(() => ({}));
  const folder = productImageFolder(collection);
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
}
