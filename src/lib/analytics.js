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
