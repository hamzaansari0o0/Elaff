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
