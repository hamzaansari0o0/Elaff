// Cloudinary serves the original upload (often several MB) unless asked
// otherwise. This inserts a transformation so the browser gets a copy sized for
// where it is shown, in the best format it supports (f_auto) at automatic
// quality (q_auto). Pure and dependency-free, so client components can use it.
const CLOUDINARY_IMAGE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

export function optimizedImage(url, width) {
  if (typeof url !== 'string' || !(width > 0)) return url;

  const match = url.match(CLOUDINARY_IMAGE);
  if (!match) return url;

  const [, prefix, rest] = match;
  // Our uploads continue with a version (v123...). Anything else after
  // "upload/" is a transformation someone chose on purpose — keep it.
  if (!/^v\d+\//.test(rest)) return url;

  return `${prefix}f_auto,q_auto,c_limit,w_${Math.round(width)}/${rest}`;
}
