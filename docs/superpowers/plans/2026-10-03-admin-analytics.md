# Admin Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Self-hosted analytics (visitors, pageviews, events, bounce rate, funnel) with a Shopify-style `/admin/analytics` page.

**Architecture:** A storefront-only client tracker posts pageviews/events to a public `POST /api/analytics/track`, which stores one `AnalyticsEvent` doc each (TTL 90 days). An admin-only `GET /api/analytics?range=` fetches the range's events and hands them to pure functions in `src/lib/analyticsMetrics.mjs` (sessionization, bounce, series, funnel) that produce one JSON report rendered by the admin page.

**Tech Stack:** Next.js 16.3.1 App Router (JS/JSX), React 19, Mongoose 9, Tailwind 4, lucide-react, Node built-in `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-03-admin-analytics-design.md`

**Deviation from spec (intentional):** the spec says "aggregation pipelines". Metrics are computed in JS over lean event docs (capped at 200k) instead, so bounce/session logic is unit-testable without a DB. Same output, simpler.

## Global Constraints
- AGENTS.md: this is a modified Next.js; check `node_modules/next/dist/docs/` before writing Next-specific code (route handlers, `cookies()`, `headers()` are **async**: `await cookies()`).
- No new npm dependencies. Charts are hand-built SVG/Tailwind.
- Retention: 90 days (TTL index on `createdAt`).
- Bounce: exactly 1 pageview AND 0 interactions (anything except `pageview`/`scroll_depth`) AND session duration < 10 000 ms.
- Session expiry: 30 minutes inactivity. Timezone for day buckets: UTC+5 (`TZ_OFFSET_MIN = 300`).
- Admin is never tracked; `/admin` paths are rejected by the track endpoint.
- Country from `x-vercel-ip-country` header only; empty string if absent.
- Event allowlist: `pageview, product_view, add_to_cart, inquiry_open, inquiry_submit, contact_submit, newsletter_signup, whatsapp_click, chatbot_open, search, scroll_depth`.
- Admin styling follows existing admin pages: `font-fraunces text-2xl font-black text-gray-900` heading, `bg-white border border-gray-200 rounded-xl` cards, `text-xs font-bold text-gray-400 uppercase tracking-wide` labels, `brand-navy` / `brand-amber` colors.
- Do **not** run `git commit`/`git add` — the working tree contains the user's unrelated pending changes (`ProductProfileTabs.jsx`). Commit only if the user asks. Never touch `src/components/product/ProductProfileTabs.jsx`.

## Review Focus
- Visitor with localStorage disabled/throwing (private mode): tracker must not crash; falls back to in-memory ids.
- Empty range (zero events): report returns zeros, empty arrays, `bounceRate: 0`, zero-filled series — no NaN/division by zero; page shows an empty state.
- Same event doc fields hostile/oversized (huge `path`, non-object `meta`, bad ids, unknown `type`): track endpoint returns 400/204, never stores garbage or throws 500.
- Bots and admin-cookie requests: not stored.
- SPA referrer: `document.referrer` stays the original external referrer for the whole SPA life; it must only be sent on the first event of a new session, else later internal pages/new sessions get credited to the wrong source.
- React StrictMode / double effects: one navigation must not create two `pageview`s.
- A session whose events straddle the range start: must not crash `buildSessions` (just uses events in range).

## File Structure
- Create `src/lib/analyticsMetrics.mjs` — pure functions (UA parsing, source classification, sessions, bounce, series, funnel, report). `.mjs` so `node --test` can import it without a bundler or `@/` alias.
- Create `tests/analyticsMetrics.test.mjs` — unit tests.
- Create `src/models/AnalyticsEvent.js` — Mongoose model + TTL.
- Create `src/app/api/analytics/track/route.js` — public ingest.
- Create `src/app/api/analytics/route.js` — admin report.
- Create `src/lib/analytics.js` — client helper `trackEvent`.
- Create `src/components/analytics/AnalyticsTracker.jsx` — pageview + scroll depth.
- Modify `src/app/(storefront)/layout.jsx` — mount tracker.
- Modify event sources (Task 4): `ProductDetails.jsx`, `OrderModal.jsx`, `CartInquiryModal.jsx`, `InquiryDrawer.jsx`, `InlineInquiryForm.jsx`, `ContactForm.jsx`, `Newsletter.jsx`, `Chatbot.jsx`, `SearchAutocomplete.jsx`.
- Create `src/components/admin/analytics/TrafficChart.jsx`, `StatTable.jsx`.
- Create `src/app/admin/(dashboard)/analytics/page.jsx`.
- Modify `src/components/admin/AdminSidebar.jsx` — nav item.
- Modify `package.json` — `"test": "node --test tests/"`.

---

### Task 1: Pure metrics library

**Files:**
- Create: `src/lib/analyticsMetrics.mjs`
- Create: `tests/analyticsMetrics.test.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces (all named exports of `analyticsMetrics.mjs`):
  - constants `TZ_OFFSET_MIN=300`, `SESSION_GAP_MS=1800000`, `BOUNCE_MAX_MS=10000`, `NON_INTERACTION_TYPES:Set`, `LEAD_TYPES:Set`
  - `parseUserAgent(ua: string) -> {device:'mobile'|'tablet'|'desktop', browser:string, isBot:boolean}`
  - `classifySource(referrer: string, siteHost: string) -> string` (`'direct'|'internal'|'google'|...|hostname`)
  - `buildSessions(events: Event[]) -> Session[]`
  - `rangeBounds(range: string, now?: number, tzOffsetMin?: number) -> {from:number,to:number,bucket:'hour'|'day'}`
  - `timeSeries(events, {from,to,bucket,tzOffsetMin?}) -> {key:string,visitors:number,pageviews:number}[]`
  - `buildReport(events: Event[], {from,to,bucket}) -> Report`
- `Event` = `{type,path,visitorId,sessionId,createdAt(Date|string|number),source,country,device,browser,meta}`.
- `Session` = `{sessionId,visitorId,start,end,durationMs,pageviews,interactions,entryPath,source,country,device,browser,paths:string[],types:string[],isBounce:boolean,hasLead:boolean}` (start/end are epoch ms).
- `Report` shape (consumed by Task 5/6):
```
{ range:{from,to,bucket},
  kpis:{visitors,sessions,pageviews,bounceRate,avgDurationSec},   // bounceRate is 0..1
  series:[{key,visitors,pageviews}],
  topPages:[{path,views,visitors}],
  landingPages:[{path,sessions,bounceRate,leads}],
  events:[{name,count,visitors}],
  funnel:[{step,label,sessions,pct}],                              // pct 0..1 of step-1
  sources:[{name,sessions}], countries:[{name,sessions}],
  devices:[{name,sessions}], browsers:[{name,sessions}],
  recent:[{sessionId,visitorId,start(ISO),durationSec,country,device,browser,source,entryPath,paths,types,isBounce}] }
```

- [ ] **Step 1: Write the failing tests**

Create `tests/analyticsMetrics.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseUserAgent,
  classifySource,
  buildSessions,
  rangeBounds,
  timeSeries,
  buildReport,
} from '../src/lib/analyticsMetrics.mjs';

const T0 = Date.UTC(2026, 9, 3, 6, 0, 0); // 2026-10-03 06:00 UTC = 11:00 UTC+5
const ev = (o) => ({
  type: 'pageview', path: '/', visitorId: 'v1', sessionId: 's1',
  createdAt: T0, source: 'direct', country: 'PK', device: 'desktop', browser: 'Chrome', meta: {}, ...o,
});

test('parseUserAgent detects bots, devices, browsers', () => {
  assert.equal(parseUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)').isBot, true);
  assert.equal(parseUserAgent('').isBot, true); // no UA = not a real browser
  const iphone = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1');
  assert.deepEqual([iphone.device, iphone.browser, iphone.isBot], ['mobile', 'Safari', false]);
  const win = parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36 Edg/120.0');
  assert.deepEqual([win.device, win.browser], ['desktop', 'Edge']);
  const ig = parseUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit Mobile/15E148 Instagram 300.0');
  assert.equal(ig.browser, 'Instagram');
  const tab = parseUserAgent('Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 Chrome/120 Safari/537.36');
  assert.equal(tab.device, 'tablet');
});

test('classifySource', () => {
  assert.equal(classifySource('', 'elaff.com'), 'direct');
  assert.equal(classifySource('not a url', 'elaff.com'), 'direct');
  assert.equal(classifySource('https://www.elaff.com/shop', 'elaff.com:3000'), 'internal');
  assert.equal(classifySource('https://www.google.com.pk/', 'elaff.com'), 'google');
  assert.equal(classifySource('https://l.instagram.com/?u=x', 'elaff.com'), 'instagram');
  assert.equal(classifySource('https://m.facebook.com/', 'elaff.com'), 'facebook');
  assert.equal(classifySource('https://blog.example.org/x', 'elaff.com'), 'blog.example.org');
});

test('buildSessions: bounce rules', () => {
  const events = [
    // s1: single pageview, 5s of scroll -> bounce
    ev({ sessionId: 's1' }),
    ev({ sessionId: 's1', type: 'scroll_depth', createdAt: T0 + 5000, meta: { depth: 50 } }),
    // s2: single pageview but 20s long -> not bounce
    ev({ sessionId: 's2', visitorId: 'v2' }),
    ev({ sessionId: 's2', visitorId: 'v2', type: 'scroll_depth', createdAt: T0 + 20000 }),
    // s3: single pageview + interaction -> not bounce
    ev({ sessionId: 's3', visitorId: 'v3' }),
    ev({ sessionId: 's3', visitorId: 'v3', type: 'whatsapp_click', createdAt: T0 + 1000 }),
    // s4: two pageviews -> not bounce
    ev({ sessionId: 's4', visitorId: 'v4' }),
    ev({ sessionId: 's4', visitorId: 'v4', path: '/shop', createdAt: T0 + 2000 }),
  ];
  const by = Object.fromEntries(buildSessions(events).map((s) => [s.sessionId, s]));
  assert.equal(by.s1.isBounce, true);
  assert.equal(by.s2.isBounce, false);
  assert.equal(by.s3.isBounce, false);
  assert.equal(by.s4.isBounce, false);
  assert.equal(by.s4.pageviews, 2);
  assert.deepEqual(by.s4.paths, ['/', '/shop']);
  assert.equal(by.s1.durationMs, 5000);
});

test('buildSessions: sorts unordered input, entry path & lead flag', () => {
  const events = [
    ev({ type: 'inquiry_submit', path: '/product/x', createdAt: T0 + 9000 }),
    ev({ path: '/product/x', createdAt: T0 + 1000 }),
    ev({ path: '/shop', createdAt: T0 }),
  ];
  const [s] = buildSessions(events);
  assert.equal(s.entryPath, '/shop');
  assert.equal(s.hasLead, true);
  assert.equal(s.interactions, 1);
});

test('rangeBounds: 1d is rolling hours; 7d/30d are local-day aligned', () => {
  const now = T0;
  assert.deepEqual(rangeBounds('1d', now), { from: now - 86400000, to: now, bucket: 'hour' });
  const r7 = rangeBounds('7d', now);
  assert.equal(r7.bucket, 'day');
  // local midnight of 2026-09-27 (UTC+5) = 2026-09-26T19:00Z
  assert.equal(r7.from, Date.UTC(2026, 8, 26, 19, 0, 0));
  assert.equal(rangeBounds('30d', now).bucket, 'day');
  assert.deepEqual(rangeBounds('garbage', now), r7); // falls back to 7d
});

test('timeSeries zero-fills and counts unique visitors per local day', () => {
  const { from, to, bucket } = rangeBounds('7d', T0);
  const rows = timeSeries(
    [ev({}), ev({ createdAt: T0 + 1000 }), ev({ visitorId: 'v2', createdAt: T0 + 2000 })],
    { from, to, bucket },
  );
  assert.equal(rows.length, 7);
  assert.equal(rows.at(-1).key, '2026-10-03');
  assert.equal(rows.at(-1).pageviews, 3);
  assert.equal(rows.at(-1).visitors, 2);
  assert.equal(rows[0].pageviews, 0);
});

test('buildReport on empty input is all zeros, no NaN', () => {
  const r = buildReport([], rangeBounds('7d', T0));
  assert.deepEqual(r.kpis, { visitors: 0, sessions: 0, pageviews: 0, bounceRate: 0, avgDurationSec: 0 });
  assert.equal(r.series.length, 7);
  assert.deepEqual(r.topPages, []);
  assert.deepEqual(r.recent, []);
  assert.deepEqual(r.funnel.map((f) => f.sessions), [0, 0, 0, 0]);
  assert.ok(r.funnel.every((f) => f.pct === 0));
});

test('buildReport: kpis, pages, events, funnel', () => {
  const events = [
    ev({ sessionId: 's1', path: '/product/a' }),                                         // bounce
    ev({ sessionId: 's2', visitorId: 'v2', path: '/product/a', source: 'google' }),
    ev({ sessionId: 's2', visitorId: 'v2', type: 'product_view', path: '/product/a', createdAt: T0 + 1000 }),
    ev({ sessionId: 's2', visitorId: 'v2', type: 'inquiry_open', path: '/product/a', createdAt: T0 + 2000 }),
    ev({ sessionId: 's2', visitorId: 'v2', type: 'inquiry_submit', path: '/product/a', createdAt: T0 + 3000 }),
    ev({ sessionId: 's2', visitorId: 'v2', type: 'scroll_depth', path: '/product/a', createdAt: T0 + 4000, meta: { depth: 75 } }),
  ];
  const r = buildReport(events, rangeBounds('7d', T0));
  assert.equal(r.kpis.visitors, 2);
  assert.equal(r.kpis.sessions, 2);
  assert.equal(r.kpis.pageviews, 2);
  assert.equal(r.kpis.bounceRate, 0.5);
  assert.equal(r.kpis.avgDurationSec, 2); // (0s + 4s) / 2
  assert.deepEqual(r.topPages, [{ path: '/product/a', views: 2, visitors: 2 }]);
  assert.deepEqual(r.landingPages, [{ path: '/product/a', sessions: 2, bounceRate: 0.5, leads: 1 }]);
  const names = r.events.map((e) => e.name);
  assert.ok(names.includes('scroll_depth 75%'));
  assert.ok(!names.includes('pageview'));
  assert.deepEqual(r.funnel.map((f) => f.sessions), [2, 1, 1, 1]);
  assert.equal(r.funnel[1].pct, 0.5);
  assert.deepEqual(r.sources.map((s) => s.name).sort(), ['direct', 'google']);
  assert.equal(r.recent.length, 2);
  assert.equal(typeof r.recent[0].start, 'string');
});
```

- [ ] **Step 2: Add test script and run to verify failure**

In `package.json` `"scripts"` add `"test": "node --test tests/"` after `"lint"` (add the comma). Run `cd /g/fahad && npm test`.
Expected: FAIL — `Cannot find module '.../analyticsMetrics.mjs'`.

- [ ] **Step 3: Implement `src/lib/analyticsMetrics.mjs`**

```js
// Pure analytics math — no DB, no Next imports, so `node --test` can load it directly.

export const TZ_OFFSET_MIN = 300; // UTC+5 — day buckets follow the owner's local midnight
export const SESSION_GAP_MS = 30 * 60 * 1000;
export const BOUNCE_MAX_MS = 10_000;
export const NON_INTERACTION_TYPES = new Set(['pageview', 'scroll_depth']);
export const LEAD_TYPES = new Set(['inquiry_submit', 'contact_submit']);

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|curl|wget|python|node-fetch|axios|monitor|pingdom|uptime/i;

export function parseUserAgent(ua = '') {
  const s = String(ua || '');
  if (!s || BOT_RE.test(s)) return { device: 'desktop', browser: 'Other', isBot: true };

  let device = 'desktop';
  if (/ipad|tablet|(android(?!.*mobi))/i.test(s)) device = 'tablet';
  else if (/mobi|iphone|android/i.test(s)) device = 'mobile';

  let browser = 'Other';
  if (/instagram/i.test(s)) browser = 'Instagram';
  else if (/FBAN|FBAV/.test(s)) browser = 'Facebook';
  else if (/Edg\//.test(s)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(s)) browser = 'Opera';
  else if (/SamsungBrowser/.test(s)) browser = 'Samsung';
  else if (/Firefox\/|FxiOS/.test(s)) browser = 'Firefox';
  else if (/Chrome\/|CriOS/.test(s)) browser = 'Chrome';
  else if (/Safari\//.test(s)) browser = 'Safari';

  return { device, browser, isBot: false };
}

const hostOf = (h) => String(h || '').replace(/:\d+$/, '').replace(/^www\./, '').toLowerCase();

export function classifySource(referrer, siteHost) {
  if (!referrer) return 'direct';
  let host;
  try {
    host = hostOf(new URL(referrer).hostname);
  } catch {
    return 'direct';
  }
  if (host === hostOf(siteHost)) return 'internal';
  if (/(^|\.)google\./.test(host)) return 'google';
  if (/(^|\.)bing\.com$/.test(host)) return 'bing';
  if (/(^|\.)instagram\.com$/.test(host)) return 'instagram';
  if (/(^|\.)(facebook\.com|fb\.com|fb\.me)$/.test(host)) return 'facebook';
  if (/(^|\.)(twitter\.com|x\.com|t\.co)$/.test(host)) return 'x';
  if (/(^|\.)(linkedin\.com|lnkd\.in)$/.test(host)) return 'linkedin';
  if (/(^|\.)(whatsapp\.com|wa\.me)$/.test(host)) return 'whatsapp';
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return 'youtube';
  if (/(^|\.)tiktok\.com$/.test(host)) return 'tiktok';
  return host;
}

const ms = (v) => +new Date(v);

export function buildSessions(events) {
  const bySession = new Map();
  for (const e of events) {
    if (!bySession.has(e.sessionId)) bySession.set(e.sessionId, []);
    bySession.get(e.sessionId).push(e);
  }

  const sessions = [];
  for (const [sessionId, list] of bySession) {
    list.sort((a, b) => ms(a.createdAt) - ms(b.createdAt));
    const first = list[0];
    const start = ms(first.createdAt);
    const end = ms(list[list.length - 1].createdAt);
    const durationMs = end - start;
    const pageviews = list.filter((e) => e.type === 'pageview').length;
    const interactions = list.filter((e) => !NON_INTERACTION_TYPES.has(e.type)).length;
    const firstPageview = list.find((e) => e.type === 'pageview') || first;

    sessions.push({
      sessionId,
      visitorId: first.visitorId,
      start,
      end,
      durationMs,
      pageviews,
      interactions,
      entryPath: firstPageview.path,
      source: first.source || 'direct',
      country: first.country || '',
      device: first.device || 'desktop',
      browser: first.browser || 'Other',
      paths: [...new Set(list.filter((e) => e.type === 'pageview').map((e) => e.path))],
      types: [...new Set(list.map((e) => e.type))],
      isBounce: pageviews === 1 && interactions === 0 && durationMs < BOUNCE_MAX_MS,
      hasLead: list.some((e) => LEAD_TYPES.has(e.type)),
    });
  }
  return sessions;
}

export function rangeBounds(range, now = Date.now(), tzOffsetMin = TZ_OFFSET_MIN) {
  if (range === '1d') return { from: now - DAY_MS, to: now, bucket: 'hour' };
  const days = range === '30d' ? 30 : 7;
  const off = tzOffsetMin * 60_000;
  const todayStart = Math.floor((now + off) / DAY_MS) * DAY_MS - off;
  return { from: todayStart - (days - 1) * DAY_MS, to: now, bucket: 'day' };
}

export function timeSeries(events, { from, to, bucket = 'day', tzOffsetMin = TZ_OFFSET_MIN }) {
  const step = bucket === 'hour' ? HOUR_MS : DAY_MS;
  const keyLen = bucket === 'hour' ? 13 : 10;
  const off = tzOffsetMin * 60_000;
  const keyOf = (t) => new Date(t + off).toISOString().slice(0, keyLen);

  const buckets = new Map();
  const alignedFrom = Math.floor((from + off) / step) * step - off;
  for (let t = alignedFrom; t <= to; t += step) {
    buckets.set(keyOf(t), { key: keyOf(t), visitors: new Set(), pageviews: 0 });
  }

  for (const e of events) {
    const b = buckets.get(keyOf(ms(e.createdAt)));
    if (!b) continue;
    b.visitors.add(e.visitorId);
    if (e.type === 'pageview') b.pageviews += 1;
  }
  return [...buckets.values()].map((b) => ({ key: b.key, visitors: b.visitors.size, pageviews: b.pageviews }));
}

function tally(items, keyFn) {
  const m = new Map();
  for (const it of items) {
    const k = keyFn(it);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([name, sessions]) => ({ name: name || 'unknown', sessions })).sort((a, b) => b.sessions - a.sessions);
}

const FUNNEL = [
  ['visit', 'Visited site'],
  ['product_view', 'Viewed a product'],
  ['inquiry_open', 'Started an inquiry'],
  ['inquiry_submit', 'Sent an inquiry'],
];

export function buildReport(events, { from, to, bucket = 'day' }) {
  const sessions = buildSessions(events);
  const pageviewEvents = events.filter((e) => e.type === 'pageview');

  const visitors = new Set(events.map((e) => e.visitorId)).size;
  const bounced = sessions.filter((s) => s.isBounce).length;
  const totalDuration = sessions.reduce((n, s) => n + s.durationMs, 0);

  const kpis = {
    visitors,
    sessions: sessions.length,
    pageviews: pageviewEvents.length,
    bounceRate: sessions.length ? bounced / sessions.length : 0,
    avgDurationSec: sessions.length ? Math.round(totalDuration / sessions.length / 1000) : 0,
  };

  // Top pages
  const pages = new Map();
  for (const e of pageviewEvents) {
    const p = pages.get(e.path) || { path: e.path, views: 0, v: new Set() };
    p.views += 1;
    p.v.add(e.visitorId);
    pages.set(e.path, p);
  }
  const topPages = [...pages.values()]
    .map((p) => ({ path: p.path, views: p.views, visitors: p.v.size }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20);

  // Landing pages: where sessions start, how many bounce, how many become leads
  const landing = new Map();
  for (const s of sessions) {
    const l = landing.get(s.entryPath) || { path: s.entryPath, sessions: 0, bounces: 0, leads: 0 };
    l.sessions += 1;
    if (s.isBounce) l.bounces += 1;
    if (s.hasLead) l.leads += 1;
    landing.set(s.entryPath, l);
  }
  const landingPages = [...landing.values()]
    .map((l) => ({ path: l.path, sessions: l.sessions, bounceRate: l.bounces / l.sessions, leads: l.leads }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20);

  // Events (everything except plain pageviews; scroll depth split per threshold)
  const evMap = new Map();
  for (const e of events) {
    if (e.type === 'pageview') continue;
    const name = e.type === 'scroll_depth' ? `scroll_depth ${e.meta?.depth ?? '?'}%` : e.type;
    const r = evMap.get(name) || { name, count: 0, v: new Set() };
    r.count += 1;
    r.v.add(e.visitorId);
    evMap.set(name, r);
  }
  const eventRows = [...evMap.values()]
    .map((r) => ({ name: r.name, count: r.count, visitors: r.v.size }))
    .sort((a, b) => b.count - a.count);

  // Funnel (sessions that contain each step; steps are independent, not nested)
  const base = sessions.filter((s) => s.pageviews > 0).length;
  const funnel = FUNNEL.map(([step, label]) => {
    const n = step === 'visit' ? base : sessions.filter((s) => s.types.includes(step)).length;
    return { step, label, sessions: n, pct: base ? n / base : 0 };
  });

  const recent = [...sessions]
    .sort((a, b) => b.start - a.start)
    .slice(0, 50)
    .map((s) => ({
      sessionId: s.sessionId,
      visitorId: s.visitorId,
      start: new Date(s.start).toISOString(),
      durationSec: Math.round(s.durationMs / 1000),
      country: s.country,
      device: s.device,
      browser: s.browser,
      source: s.source,
      entryPath: s.entryPath,
      paths: s.paths,
      types: s.types.filter((t) => t !== 'pageview'),
      isBounce: s.isBounce,
    }));

  return {
    range: { from, to, bucket },
    kpis,
    series: timeSeries(events, { from, to, bucket }),
    topPages,
    landingPages,
    events: eventRows,
    funnel,
    sources: tally(sessions, (s) => s.source),
    countries: tally(sessions, (s) => s.country),
    devices: tally(sessions, (s) => s.device),
    browsers: tally(sessions, (s) => s.browser),
    recent,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /g/fahad && npm test`
Expected: all tests PASS. If the `7d` `from` assertion fails, recheck `rangeBounds` local-midnight math rather than editing the test.

---

### Task 2: Model and ingest endpoint

**Files:**
- Create: `src/models/AnalyticsEvent.js`
- Create: `src/app/api/analytics/track/route.js`

**Interfaces:**
- Consumes: `parseUserAgent`, `classifySource` from `@/lib/analyticsMetrics.mjs`; `requireAdmin` from `@/lib/auth`; `connectDB` from `@/lib/mongodb`.
- Produces: `POST /api/analytics/track` body `{type,path,visitorId,sessionId,referrer?,meta?}` → `204` always on valid/ignored input, `400` on invalid. Model `AnalyticsEvent` with fields `type,path,visitorId,sessionId,referrer,source,country,device,browser,meta,createdAt`.

- [ ] **Step 1: Create the model**

```js
import mongoose from 'mongoose';

const NINETY_DAYS = 90 * 24 * 60 * 60;

const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    path: { type: String, required: true },
    visitorId: { type: String, required: true },
    sessionId: { type: String, required: true },
    referrer: { type: String, default: '' },
    source: { type: String, default: 'direct' },
    country: { type: String, default: '' },
    device: { type: String, default: 'desktop' },
    browser: { type: String, default: 'Other' },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    // TTL: Mongo deletes documents 90 days after createdAt.
    createdAt: { type: Date, default: Date.now, index: { expireAfterSeconds: NINETY_DAYS } },
  },
  { versionKey: false }
);

AnalyticsEventSchema.index({ sessionId: 1, createdAt: 1 });

export default mongoose.models.AnalyticsEvent || mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
```

- [ ] **Step 2: Create the ingest route**

Read `node_modules/next/dist/docs/01-app/` route-handler docs first to confirm `request.headers`/`request.json()`/`new Response(null,{status:204})` usage for this Next version.

```js
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
```

- [ ] **Step 3: Verify with the dev server**

Run `npm run dev` in the background (note the port). With curl (no admin cookie, with a browser-like UA):

```bash
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36'
curl -s -o /dev/null -w "%{http_code}\n" -X POST localhost:3000/api/analytics/track -H "User-Agent: $UA" -H "Content-Type: text/plain" -d '{"type":"pageview","path":"/shop","visitorId":"visitor-test-1","sessionId":"session-test-1","referrer":"https://www.google.com/"}'
```
Expected: `204`. Then these must return the stated code: unknown type → `400`; `path:"/admin/x"` → `204` (not stored); no UA header (`-H "User-Agent:"`) → `204` (not stored); `visitorId:"x"` → `400`; body `not json` → `400`.
Confirm exactly one document was stored (use the next task's endpoint or the MongoDB MCP/mongosh if available; otherwise verify in Task 5/7).

---

### Task 3: Client helper and tracker

**Files:**
- Create: `src/lib/analytics.js`
- Create: `src/components/analytics/AnalyticsTracker.jsx`
- Modify: `src/app/(storefront)/layout.jsx`

**Interfaces:**
- Produces: `trackEvent(type: string, meta?: object, pathOverride?: string): void` — safe to call anywhere on the client, never throws. Used by Task 4.

- [ ] **Step 1: Create `src/lib/analytics.js`**

```js
// Client-side tracking helper. Never throws — analytics must not break the storefront.

const VISITOR_KEY = 'elaff_vid';
const SESSION_KEY = 'elaff_sid';
const SESSION_GAP_MS = 30 * 60 * 1000;

// In-memory fallback when localStorage is unavailable (private mode, blocked storage).
let memVisitor = null;
let memSession = null;
// Set when a fresh session starts; consumed by the first event so the (SPA-stale)
// document.referrer is only credited once per session.
let pendingReferrer = false;

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    if (!memVisitor) memVisitor = newId();
    return memVisitor;
  }
}

function getSessionId() {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    if (stored && now - stored.last < SESSION_GAP_MS) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ id: stored.id, last: now }));
      return stored.id;
    }
    const id = newId();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ id, last: now }));
    pendingReferrer = true;
    return id;
  } catch {
    if (!memSession || now - memSession.last >= SESSION_GAP_MS) {
      memSession = { id: newId(), last: now };
      pendingReferrer = true;
    } else {
      memSession.last = now;
    }
    return memSession.id;
  }
}

export function trackEvent(type, meta = {}, pathOverride) {
  try {
    if (typeof window === 'undefined') return;
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    let referrer = '';
    if (pendingReferrer) {
      referrer = document.referrer || '';
      pendingReferrer = false;
    }
    const payload = JSON.stringify({
      type,
      path: pathOverride || window.location.pathname,
      visitorId,
      sessionId,
      referrer,
      meta,
    });
    // text/plain keeps this a "simple" request — no CORS preflight, survives page unload.
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/track', new Blob([payload], { type: 'text/plain' }));
    } else {
      fetch('/api/analytics/track', { method: 'POST', body: payload, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
    }
  } catch {
    // ignore
  }
}
```

- [ ] **Step 2: Create `src/components/analytics/AnalyticsTracker.jsx`**

```jsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

const DEPTHS = [25, 50, 75, 100];

// Mounted once in the storefront layout. Sends a pageview on every route change and
// scroll-depth milestones (25/50/75/100%) once each per page. Renders nothing.
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPathRef = useRef(null);

  useEffect(() => {
    // Guard against React strict-mode double effects: one navigation = one pageview.
    // (Only the pageview is guarded — the scroll listener below must still re-attach.)
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname;
      trackEvent('pageview', {}, pathname);
    }

    const fired = new Set();
    let ticking = false;

    function check() {
      ticking = false;
      const doc = document.documentElement;
      const total = doc.scrollHeight;
      if (!total) return;
      const pct = ((window.scrollY + window.innerHeight) / total) * 100;
      for (const d of DEPTHS) {
        if (pct >= d - 1 && !fired.has(d)) {
          fired.add(d);
          trackEvent('scroll_depth', { depth: d }, pathname);
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(check);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
```

- [ ] **Step 3: Mount in the storefront layout**

In `src/app/(storefront)/layout.jsx` add `import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';` and render `<AnalyticsTracker />` as the first child inside `<MotionConfig reducedMotion="user">`.

- [ ] **Step 4: Verify in a browser (logged out of admin)**

With dev server running, open `http://localhost:3000/` in a browser **not logged in to /admin** (incognito), navigate to `/shop`, scroll to the bottom. In DevTools → Network, expect `track` requests: `pageview` for `/`, `pageview` for `/shop`, and `scroll_depth` 25/50/75/100 (each once). Expect each to return `204`. Reloading should reuse the same `elaff_vid` in localStorage. (If logged in as admin the endpoint returns 204 but stores nothing — by design.)

---

### Task 4: Wire up events

**Files (modify):** `src/components/product/ProductDetails.jsx`, `src/components/product/OrderModal.jsx`, `src/components/cart/CartInquiryModal.jsx`, `src/components/home/InquiryDrawer.jsx`, `src/components/product/InlineInquiryForm.jsx`, `src/components/contact/ContactForm.jsx`, `src/components/home/Newsletter.jsx`, `src/components/chatbot/Chatbot.jsx`, `src/components/layout/SearchAutocomplete.jsx`

**Interfaces:**
- Consumes: `trackEvent(type, meta?)` from `@/lib/analytics`.

Add `import { trackEvent } from '@/lib/analytics';` to each file below (after the last existing import). Make exactly these edits:

- [ ] **Step 1: `ProductDetails.jsx`**
  - Right after `const { addItem, isInCart } = useCart();` (inside `ProductDetails`, before the `if (!product) return` early return), add:
    ```jsx
    useEffect(() => {
      if (product?.slug) trackEvent('product_view', { slug: product.slug, title: product.title });
    }, [product?.slug]); // eslint-disable-line react-hooks/exhaustive-deps
    ```
  - In `handleAddToCart`, after `addItem({...});` add `trackEvent('add_to_cart', { slug: product.slug });`.
  - Replace `onClick={() => setIsModalOpen(true)}` (the "Send Inquiry" button, ~line 375) with
    `onClick={() => { trackEvent('inquiry_open', { from: 'product', slug: product.slug }); setIsModalOpen(true); }}`.

- [ ] **Step 2: `OrderModal.jsx`** — after `setIsSuccess(true);` (inside the `try`, right after the `!res.ok` check) add `trackEvent('inquiry_submit', { from: 'product_modal', slug: product.slug });`.

- [ ] **Step 3: `CartInquiryModal.jsx`**
  - Change the react import to `import { useEffect, useState } from 'react';`.
  - After `useLockBodyScroll(isOpen);` and **before** `if (!isOpen) return null;` add:
    ```jsx
    useEffect(() => {
      if (isOpen) trackEvent('inquiry_open', { from: 'cart' });
    }, [isOpen]);
    ```
  - After `setIsSuccess(true);` add `trackEvent('inquiry_submit', { from: 'cart', items: items.length });` — place it **before** `clearCart();` (items is still populated).

- [ ] **Step 4: `InquiryDrawer.jsx`**
  - Change react import to `import { useEffect, useState } from 'react';`.
  - After `useLockBodyScroll(isOpen);` add:
    ```jsx
    useEffect(() => {
      if (isOpen) trackEvent('inquiry_open', { from: 'drawer' });
    }, [isOpen]);
    ```
  - After `setIsSuccess(true);` add `trackEvent('inquiry_submit', { from: 'drawer' });`.

- [ ] **Step 5: `InlineInquiryForm.jsx`** — after `setIsSuccess(true);` add `trackEvent('inquiry_submit', { from: 'inline', slug: product.slug });`.

- [ ] **Step 6: `ContactForm.jsx`** — after `setIsSuccess(true);` (first occurrence, inside `try`) add `trackEvent('contact_submit');`.

- [ ] **Step 7: `Newsletter.jsx`** — after `setStatus('success');` add `trackEvent('newsletter_signup');`.

- [ ] **Step 8: `Chatbot.jsx`**
  - In `handleChatClick`, replace the final two lines
    ```jsx
    setShowHint(false);
    setIsOpen((v) => !v);
    ```
    with
    ```jsx
    setShowHint(false);
    if (!isOpen) trackEvent('chatbot_open');
    setIsOpen((v) => !v);
    ```
  - In `handleWhatsAppClick`, replace the final `setShowHint(false);` (the last statement of the function, after the `frontButton !== 'whatsapp'` block) with `setShowHint(false);\n    trackEvent('whatsapp_click');`. Do **not** change the earlier `setShowHint(true)` branches.

- [ ] **Step 9: `SearchAutocomplete.jsx`** — in `submitFullSearch`, after `if (!trimmed) return;` add `trackEvent('search', { query: trimmed.slice(0, 80) });`.

- [ ] **Step 10: Lint and verify**

Run `cd /g/fahad && npx eslint src/lib/analytics.js src/components/analytics src/components/product/ProductDetails.jsx src/components/product/OrderModal.jsx src/components/cart/CartInquiryModal.jsx src/components/home/InquiryDrawer.jsx src/components/product/InlineInquiryForm.jsx src/components/contact/ContactForm.jsx src/components/home/Newsletter.jsx src/components/chatbot/Chatbot.jsx src/components/layout/SearchAutocomplete.jsx`
Expected: no new errors (pre-existing warnings are fine; compare with `git stash`-free judgment — only report issues in lines you added).
Then in an incognito browser: open a product page (`product_view`), click Add to Cart (`add_to_cart`), click Send Inquiry (`inquiry_open`), open chatbot (`chatbot_open`), click WhatsApp (`whatsapp_click`), run a search (`search`). Confirm each appears as a `204` request in Network. Do **not** submit real inquiries/contact/newsletter forms for verification (they email the owner / write real records); verify those three by code review of the inserted line placement instead.

---

### Task 5: Report API

**Files:**
- Create: `src/app/api/analytics/route.js`

**Interfaces:**
- Consumes: `rangeBounds`, `buildReport` from `@/lib/analyticsMetrics.mjs`; `AnalyticsEvent`; `requireAdmin`.
- Produces: `GET /api/analytics?range=1d|7d|30d` → `Report` JSON (shape in Task 1); `401` if not admin.

- [ ] **Step 1: Create the route**

```js
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { rangeBounds, buildReport } from '@/lib/analyticsMetrics.mjs';

const MAX_EVENTS = 200_000;

// Admin-only: aggregated traffic report for the Analytics tab.
export async function GET(request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const range = request.nextUrl.searchParams.get('range');
  const bounds = rangeBounds(range);

  await connectDB();
  const events = await AnalyticsEvent.find({ createdAt: { $gte: new Date(bounds.from), $lte: new Date(bounds.to) } })
    .select('type path visitorId sessionId createdAt source country device browser meta -_id')
    .sort({ createdAt: -1 })
    .limit(MAX_EVENTS)
    .lean();

  return NextResponse.json(buildReport(events, bounds));
}
```

- [ ] **Step 2: Verify**

Log in to `/admin` in the browser, then open `http://localhost:3000/api/analytics?range=7d` in the same browser. Expected: JSON with `kpis.sessions >= 1` including the events from earlier curl/browser tests (the curl test visitor: path `/shop`, source `google`). Unauthenticated `curl -i localhost:3000/api/analytics` → `401`. `?range=bogus` → behaves as 7d.

---

### Task 6: Admin page and sidebar

**Files:**
- Create: `src/components/admin/analytics/TrafficChart.jsx`
- Create: `src/components/admin/analytics/StatTable.jsx`
- Create: `src/app/admin/(dashboard)/analytics/page.jsx`
- Modify: `src/components/admin/AdminSidebar.jsx`

**Interfaces:**
- Consumes: `GET /api/analytics?range=` Report.

- [ ] **Step 1: `TrafficChart.jsx`** — dependency-free SVG bars (pageviews, light) with a visitors line.

```jsx
'use client';

import { useState } from 'react';

// series: [{ key, visitors, pageviews }]; key is 'YYYY-MM-DD' or 'YYYY-MM-DDTHH'.
function label(key) {
  return key.length > 10 ? `${key.slice(11)}:00` : key.slice(5);
}

export default function TrafficChart({ series }) {
  const [hover, setHover] = useState(null);
  const W = 800;
  const H = 220;
  const pad = { l: 36, r: 8, t: 12, b: 24 };
  const max = Math.max(1, ...series.map((d) => Math.max(d.pageviews, d.visitors)));
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const step = innerW / Math.max(1, series.length);
  const barW = Math.max(2, step * 0.6);
  const y = (v) => pad.t + innerH - (v / max) * innerH;
  const x = (i) => pad.l + i * step + step / 2;
  const line = series.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.visitors)}`).join(' ');
  const every = Math.ceil(series.length / 8);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Daily traffic">
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(max * t)} y2={y(max * t)} stroke="#E2E8F0" />
            <text x={pad.l - 6} y={y(max * t) + 3} textAnchor="end" fontSize="10" fill="#94A3B8">
              {Math.round(max * t)}
            </text>
          </g>
        ))}
        {series.map((d, i) => (
          <rect key={d.key} x={x(i) - barW / 2} y={y(d.pageviews)} width={barW} height={pad.t + innerH - y(d.pageviews)} fill="#CBD5E1" rx="2" />
        ))}
        <path d={line} fill="none" stroke="#0F172A" strokeWidth="2" />
        {series.map((d, i) => (
          <g key={`p-${d.key}`}>
            <circle cx={x(i)} cy={y(d.visitors)} r={hover === i ? 4 : 2.5} fill="#0F172A" />
            {i % every === 0 && (
              <text x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#94A3B8">
                {label(d.key)}
              </text>
            )}
            <rect x={x(i) - step / 2} y={pad.t} width={step} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
          </g>
        ))}
      </svg>
      {hover !== null && series[hover] && (
        <div className="absolute top-0 right-0 bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
          <p className="font-bold text-gray-900">{label(series[hover].key)}</p>
          <p className="text-gray-600">Visitors: <b>{series[hover].visitors}</b></p>
          <p className="text-gray-600">Page views: <b>{series[hover].pageviews}</b></p>
        </div>
      )}
      <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-300" /> Page views</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-900" /> Visitors</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `StatTable.jsx`** — reusable table with optional inline bar.

```jsx
// columns: [{ key, label, align?: 'right', render?: (row) => node }]
// barKey: numeric column to draw a proportional background bar behind the first cell.
export default function StatTable({ title, subtitle, columns, rows, barKey, empty = 'No data yet' }) {
  const max = barKey ? Math.max(1, ...rows.map((r) => r[barKey] || 0)) : 1;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-sm font-black text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {rows.length === 0 ? (
        <p className="px-5 pb-5 text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wide border-t border-gray-100">
                {columns.map((c) => (
                  <th key={c.key} className={`px-5 py-2 ${c.align === 'right' ? 'text-right' : 'text-left'}`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {columns.map((c, ci) => (
                    <td key={c.key} className={`px-5 py-2 ${c.align === 'right' ? 'text-right tabular-nums' : 'text-left'} text-gray-700`}>
                      {ci === 0 && barKey ? (
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 bg-slate-100 rounded" style={{ width: `${((row[barKey] || 0) / max) * 100}%` }} />
                          <span className="relative block truncate max-w-xs font-medium">{c.render ? c.render(row) : row[c.key]}</span>
                        </div>
                      ) : c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: `analytics/page.jsx`**

```jsx
'use client';

import { useEffect, useState } from 'react';
import TrafficChart from '@/components/admin/analytics/TrafficChart';
import StatTable from '@/components/admin/analytics/StatTable';

const RANGES = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

const pct = (n) => `${(n * 100).toFixed(1)}%`;
const dur = (s) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`);
const pageCol = { key: 'path', label: 'Page' };

function Kpi({ label, value, hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch(`/api/analytics?range=${range}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Could not load analytics');
        return res.json();
      })
      .then((json) => !cancelled && setData(json))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const k = data?.kpis;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-fraunces text-2xl font-black text-gray-900">Analytics</h1>
        <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                range === r.value ? 'bg-brand-navy text-white' : 'text-gray-600 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">{error}</p>}

      {!data && loading && <p className="text-sm text-gray-400">Loading…</p>}

      {data && (
        <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Kpi label="Visitors" value={k.visitors} />
            <Kpi label="Sessions" value={k.sessions} />
            <Kpi label="Page views" value={k.pageviews} />
            <Kpi label="Bounce rate" value={pct(k.bounceRate)} hint="1 page, no action, under 10s" />
            <Kpi label="Avg. session" value={dur(k.avgDurationSec)} />
          </div>

          {k.sessions === 0 && (
            <p className="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-5 py-4">
              No visits recorded in this period yet. Visits by you while logged in to the admin panel are not counted.
            </p>
          )}

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-black text-gray-900 mb-3">
              {data.range.bucket === 'hour' ? 'Hourly traffic' : 'Daily traffic'}
            </h2>
            <TrafficChart series={data.series} />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-black text-gray-900 mb-3">Conversion funnel</h2>
            <div className="space-y-2">
              {data.funnel.map((f) => (
                <div key={f.step} className="flex items-center gap-3">
                  <span className="w-40 text-xs font-semibold text-gray-600 shrink-0">{f.label}</span>
                  <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-brand-navy" style={{ width: `${Math.max(f.pct * 100, f.sessions ? 1 : 0)}%` }} />
                  </div>
                  <span className="w-24 text-right text-xs tabular-nums text-gray-700">{f.sessions} · {pct(f.pct)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StatTable
              title="Top pages"
              columns={[pageCol, { key: 'views', label: 'Views', align: 'right' }, { key: 'visitors', label: 'Visitors', align: 'right' }]}
              rows={data.topPages}
              barKey="views"
            />
            <StatTable
              title="Landing pages"
              subtitle="Where visits start. High bounce + zero leads = the page to fix."
              columns={[
                pageCol,
                { key: 'sessions', label: 'Sessions', align: 'right' },
                { key: 'bounceRate', label: 'Bounce', align: 'right', render: (r) => pct(r.bounceRate) },
                { key: 'leads', label: 'Leads', align: 'right' },
              ]}
              rows={data.landingPages}
              barKey="sessions"
            />
            <StatTable
              title="Events"
              columns={[{ key: 'name', label: 'Event' }, { key: 'count', label: 'Count', align: 'right' }, { key: 'visitors', label: 'Visitors', align: 'right' }]}
              rows={data.events}
              barKey="count"
            />
            <StatTable title="Traffic sources" columns={[{ key: 'name', label: 'Source' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.sources} barKey="sessions" />
            <StatTable title="Countries" columns={[{ key: 'name', label: 'Country' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.countries} barKey="sessions" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatTable title="Devices" columns={[{ key: 'name', label: 'Device' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.devices} />
              <StatTable title="Browsers" columns={[{ key: 'name', label: 'Browser' }, { key: 'sessions', label: 'Sessions', align: 'right' }]} rows={data.browsers} />
            </div>
          </div>

          <StatTable
            title="Recent visitors"
            subtitle="Latest 50 sessions"
            columns={[
              { key: 'start', label: 'When', render: (r) => new Date(r.start).toLocaleString() },
              { key: 'country', label: 'Country', render: (r) => r.country || '—' },
              { key: 'device', label: 'Device', render: (r) => `${r.device} · ${r.browser}` },
              { key: 'source', label: 'Source' },
              { key: 'paths', label: 'Pages viewed', render: (r) => r.paths.join('  →  ') },
              { key: 'types', label: 'Events', render: (r) => r.types.filter((t) => t !== 'scroll_depth').join(', ') || '—' },
              { key: 'durationSec', label: 'Time', align: 'right', render: (r) => (r.isBounce ? `${dur(r.durationSec)} (bounce)` : dur(r.durationSec)) },
            ]}
            rows={data.recent}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Sidebar item**

In `AdminSidebar.jsx`: add `BarChart3` to the lucide-react import and insert after the Dashboard entry in `NAV_ITEMS`:
`{ href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },`

- [ ] **Step 5: Lint**

Run `cd /g/fahad && npx eslint "src/app/admin/(dashboard)/analytics" src/components/admin/analytics src/components/admin/AdminSidebar.jsx src/app/api/analytics src/models/AnalyticsEvent.js`. Expected: no errors.

---

### Task 7: End-to-end verification

- [ ] **Step 1:** `npm test` → all pass. `npx next build` (or confirm dev compile with no errors) → succeeds. Note if build fails for reasons unrelated to this work.
- [ ] **Step 2:** Seed realistic data for the dashboard by POSTing a few curl events (as in Task 2) with distinct `visitorId`/`sessionId` values: one session with only `/` pageview (bounce); one with `/` → `/shop` → `/product/x` + `product_view` + `inquiry_open`; use `referrer` values `https://l.instagram.com/` and `https://www.google.com/`. Delete this seed data afterwards (`visitorId` starting with `visitor-test` / `seed-`) — via the MongoDB MCP if available; otherwise tell the user it exists and expires in 90 days, or remove it with a one-off `node` script using `MONGODB_URI` from `.env.local`.
- [ ] **Step 3:** Open `/admin/analytics` while logged in. Verify: KPI cards populated; bounce rate matches the seeded sessions (1 of 2 = 50%); chart renders for 1d/7d/30d switching; funnel, tables, recent visitors populate; sidebar item highlights; layout works at phone width (tables scroll horizontally, no page-level horizontal scroll); empty state shows when range has no data.
- [ ] **Step 6:** Report to the user: what was built, the caveats (admin visits not tracked; country only on Vercel; seed data handling; `localhost` testing needs incognito/logged-out), and that nothing was committed.
