# Admin Analytics — Design

## Goal
An "Analytics" tab in the admin panel (Shopify-analytics style) so the owner can see traffic, page views, events, and bounce rate, and find where on the site visitors drop off and leads are lost.

## Assumptions
- No analytics exists today; tracking is self-hosted in the existing MongoDB (Mongoose).
- Deployment is serverless (Vercel-like), so every pageview/event is one small document.
- "Who visited" = anonymous visitor (random ID) with country, device, browser, referrer. No PII unless they submit a form.
- Country comes from the `x-vercel-ip-country` header; empty if not on Vercel.
- Retention: 90 days via a TTL index.

## 1. Tracking (storefront)
- Client component `AnalyticsTracker` mounted in `src/app/(storefront)/layout.jsx` only (admin is never tracked).
- Sends `pageview` on every route change (App Router `usePathname`).
- `visitorId` in `localStorage`; `sessionId` in `localStorage` with 30-minute inactivity expiry.
- Transport: `navigator.sendBeacon` (fallback `fetch keepalive`) to `POST /api/analytics/track`.
- Skips known bots (UA check) and any browser holding the admin session indicator is not feasible client-side; server skips requests carrying a valid admin cookie.
- Helper `trackEvent(name, meta)` in `src/lib/analytics.js` for components to call.

### Events
| Event | Where fired |
|---|---|
| `pageview` | tracker, automatic |
| `product_view` | product page |
| `add_to_cart` | CartContext add |
| `inquiry_open` | OrderModal / CartInquiryModal / InquiryDrawer open |
| `inquiry_submit` | after successful inquiry POST |
| `contact_submit` | ContactForm success |
| `newsletter_signup` | Newsletter success |
| `whatsapp_click` | WhatsApp widget/links |
| `chatbot_open` | Chatbot open |
| `search` | SearchAutocomplete submit (meta: query) |
| `scroll_depth` | tracker, once each at 25/50/75/100% per pageview (meta: depth) |

## 2. Bounce rate
A session is a **bounce** if: exactly 1 pageview, no non-pageview/non-scroll events, and duration < 10 s (no second hit). Also computed per entry page ("bounce % by landing page").

## 3. Storage
Model `AnalyticsEvent` (`src/models/AnalyticsEvent.js`):
`type, path, visitorId, sessionId, referrer, source, country, device, browser, meta (Mixed), createdAt`.
Indexes: `{createdAt:-1}`, `{sessionId:1, createdAt:1}`, TTL on `createdAt` (90 days).

## 4. API
- `POST /api/analytics/track` — public. Validates type against an allowlist, caps body size and string lengths, reads country/UA from headers, ignores bots and admin-cookie requests, returns 204.
- `GET /api/analytics?range=1d|7d|30d` — `requireAdmin()`. Runs aggregations in `src/lib/analyticsQueries.js` and returns one JSON payload.

Session/bounce/funnel math lives in pure functions (`src/lib/analyticsMetrics.js`) so it can be unit-tested without a DB.

## 5. Admin page `/admin/analytics`
Sidebar item "Analytics" (BarChart3 icon) added to `AdminSidebar.jsx`. Client page with range switcher (Today / 7 / 30 days).
- KPI cards: Visitors, Sessions, Page views, Bounce rate, Avg session duration.
- Daily traffic chart (visitors + page views per day, zero-filled).
- Top pages (views, unique visitors, bounce %), Entry pages.
- Events table (count, unique visitors).
- Conversion funnel: visit → product view → inquiry open → inquiry submit.
- Traffic sources, countries, devices/browsers.
- Recent visitors: time, country/device, source, pages visited, events fired.
- Charts are hand-built SVG/Tailwind; no new dependencies. Styling follows existing admin pages (brand-navy, rounded-lg, gray borders).

## 6. Testing
- Unit tests for metrics pure functions (bounce, sessionization, funnel, daily zero-fill). No test runner is configured in `package.json`; use Node's built-in `node:test`.
- Manual: run dev server, browse storefront, trigger events, verify they appear in `/admin/analytics`.

## Out of scope
Realtime "live now" view, IP storage, user-level profiles, A/B tests, exports.
