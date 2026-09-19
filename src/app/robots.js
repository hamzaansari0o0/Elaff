// NEXT_PUBLIC_SITE_URL must be set to the real production domain (in .env /
// hosting env vars) — falls back to localhost so this still works in dev.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
