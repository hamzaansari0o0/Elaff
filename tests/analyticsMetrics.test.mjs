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
