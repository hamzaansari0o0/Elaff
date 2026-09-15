import fs from 'fs';
import path from 'path';

const DIR = path.join(process.cwd(), 'public', 'PartnersPage');
const MIN_BYTES = 1024; // drops 1x1 tracking pixels and blank placeholder icons

// Scraping artifacts that aren't actually partner logos (e.g. the source
// page's own site branding, picked up along with the real logos).
const EXCLUDE = new Set(['imgi_163_WechatIMG72.png']);

// Real brand names — however they're cased (ARIEL, Carefree, coca-cola) —
// switch letter case at most once or twice. The scraped CDN ids (e.g.
// "ABUIABACGAAgprnkpwYoKwqETdeAjjeAg") flip case constantly, which is what
// actually distinguishes them — a plain length or digit check misses ids
// that happen to contain no digits.
function countCaseFlips(str) {
  let flips = 0;
  let prevUpper = null;
  for (const ch of str) {
    if (!/[a-zA-Z]/.test(ch)) continue;
    const isUpper = ch === ch.toUpperCase();
    if (prevUpper !== null && isUpper !== prevUpper) flips++;
    prevUpper = isUpper;
  }
  return flips;
}

function looksLikeCdnId(base) {
  const core = base.replace(/-\d+$/, '');
  if (core.length < 16) return false;
  return countCaseFlips(core) >= 4;
}

function toLabel(base) {
  if (looksLikeCdnId(base)) return 'Partner brand';
  const cleaned = base.replace(/-\d+$/, '').replace(/[-_]+/g, ' ').trim();
  return cleaned.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// Reads /public/PartnersPage, keeping the highest-resolution file for each
// logo (the folder has multiple WordPress-generated sizes per image, e.g.
// "colgate-1-100x100.png" and "colgate-1-1536x389.png" are the same logo).
export function getPartnerLogos() {
  let files;
  try {
    files = fs.readdirSync(DIR);
  } catch {
    return [];
  }

  const groups = new Map();
  for (const file of files) {
    if (file.endsWith('.zip') || file.endsWith('.js') || file.endsWith('.json') || EXCLUDE.has(file)) continue;

    let size;
    try {
      size = fs.statSync(path.join(DIR, file)).size;
    } catch {
      continue;
    }
    if (size < MIN_BYTES) continue;

    const ext = path.extname(file);
    let base = file.replace(/^imgi_\d+_/, '');
    base = base.slice(0, base.length - ext.length);
    base = base.replace(/-\d{2,4}x\d{2,4}$/, ''); // strip WP size suffix, e.g. -800x325
    const key = base + ext;

    const existing = groups.get(key);
    if (!existing || size > existing.size) {
      groups.set(key, { file, size, base });
    }
  }

  return [...groups.values()]
    .sort((a, b) => a.base.localeCompare(b.base))
    .map(({ file, base }) => ({
      src: `/PartnersPage/${encodeURIComponent(file)}`,
      alt: toLabel(base),
    }));
}
