import { v2 as cloudinary } from 'cloudinary';
import { slugify } from './slugify';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export const UPLOAD_ROOT = 'elaff-products';

// Cloudinary creates folders implicitly from the `folder` path on upload —
// there's no separate "create folder" call. Filing each product's images
// under its collection means the collection folder just appears the first
// time a product in it is saved. Falls back to the flat root folder when
// there's no collection to file the image under.
export function productImageFolder(collectionName) {
  const slug = collectionName ? slugify(collectionName) : '';
  return slug ? `${UPLOAD_ROOT}/${slug}` : UPLOAD_ROOT;
}

// Derives a Cloudinary public_id from one of our own delivery URLs, e.g.
// https://res.cloudinary.com/<cloud>/image/upload/v169.../elaff-products/frozen-food/abc123.png
// -> "elaff-products/frozen-food/abc123". Only matches our own upload root, so it
// can't be used to delete arbitrary Cloudinary assets from other folders/accounts.
export function publicIdFromUrl(url) {
  const match = url.match(new RegExp(`/upload/(?:v\\d+/)?(${UPLOAD_ROOT}/[^.]+)\\.[a-zA-Z0-9]+(?:\\?.*)?$`));
  return match ? match[1] : null;
}

// Best-effort bulk delete — a network blip or an already-missing asset
// shouldn't block whatever caller (product delete, image removal) triggered this.
export async function deleteCloudinaryImages(urls = []) {
  const ids = urls.map(publicIdFromUrl).filter(Boolean);
  if (ids.length === 0) return;
  await Promise.allSettled(ids.map((id) => cloudinary.uploader.destroy(id)));
}

// Product images live in the main gallery and can also be embedded in Company
// Profile page sections (imageText/gallery blocks) — both need cleaning up or a
// deleted product still leaves orphaned Cloudinary assets. Shared by the single
// and bulk product-delete routes.
export function collectProductImageUrls(product) {
  const urls = [...(product.images || [])];
  for (const section of product.pageSections || []) {
    if (section.image) urls.push(section.image);
    if (Array.isArray(section.images)) urls.push(...section.images);
  }
  return urls;
}
