import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { parseUserAgent, classifySource } from '@/lib/analyticsMetrics.mjs';

const ALLOWED_TYPES = new Set([
  'pageview', 'product_view', 'add_to_cart', 'inquiry_open', 'inquiry_submit', 'contact_submit',
  'newsletter_signup', 'whatsapp_click', 'chatbot_open', 'search', 'scroll_depth',
]);
const ID_RE = /^[A-Za-z0-9-]{8,64}$/;
const MAX_META_CHARS = 500;

function bad(message) {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Public: the storefront tracker posts here (via sendBeacon). Always answers 204 for
// anything it deliberately ignores (bots, admin) so the client never retries.
export async function POST(request) {
  let body;
  try {
    // sendBeacon sends text/plain, so parse the raw text rather than request.json().
    body = JSON.parse(await request.text());
  } catch {
    return bad('Invalid JSON');
  }
  if (!body || typeof body !== 'object') return bad('Invalid body');

  const { type, path, visitorId, sessionId } = body;
  if (!ALLOWED_TYPES.has(type)) return bad('Unknown event type');
  if (typeof path !== 'string' || !path.startsWith('/') || path.length > 300) return bad('Invalid path');
  if (path === '/admin' || path.startsWith('/admin/')) return new NextResponse(null, { status: 204 });
  if (!ID_RE.test(visitorId || '') || !ID_RE.test(sessionId || '')) return bad('Invalid ids');

  const ua = parseUserAgent(request.headers.get('user-agent') || '');
  if (ua.isBot) return new NextResponse(null, { status: 204 });
  if (await requireAdmin()) return new NextResponse(null, { status: 204 });

  let meta = {};
  if (body.meta && typeof body.meta === 'object' && !Array.isArray(body.meta)) {
    try {
      if (JSON.stringify(body.meta).length <= MAX_META_CHARS) meta = body.meta;
    } catch {
      // unserializable meta is dropped
    }
  }

  const referrer = typeof body.referrer === 'string' ? body.referrer.slice(0, 300) : '';
  const siteHost = request.headers.get('host') || '';

  await connectDB();
  await AnalyticsEvent.create({
    type,
    path,
    visitorId,
    sessionId,
    referrer,
    source: classifySource(referrer, siteHost),
    country: (request.headers.get('x-vercel-ip-country') || '').slice(0, 2).toUpperCase(),
    device: ua.device,
    browser: ua.browser,
    meta,
  });

  return new NextResponse(null, { status: 204 });
}
