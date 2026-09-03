// Flexible header matching so admins can upload real supplier spreadsheets
// without reshaping them first — unrecognized columns aren't dropped, they
// fall through into the product's Specifications list automatically.
const HEADER_ALIASES = {
  title: ['title', 'product title', 'name'],
  slug: ['slug', 'handle'],
  sku: ['sku', 'model number', 'model no', 'model'],
  category: ['category', 'category label'],
  collections: ['collections', 'collection'],
  priceUnit: ['price unit', 'priceunit', 'unit'],
  oldPrice: ['old price', 'oldprice', 'compare at price'],
  moq: ['moq', 'minimum order', 'min order'],
  moqUnit: ['moq unit', 'moqunit'],
  leadTime: ['lead time', 'leadtime'],
  badge: ['badge'],
  tags: ['tags'],
  status: ['status'],
  featured: ['featured'],
  shortDescription: ['short description', 'shortdescription'],
  fullDescription: ['full description', 'description', 'fulldescription', 'product description'],
  specifications: ['specifications', 'specs'],
};

// Any column whose header matches one of these counts as an image source.
// Real supplier sheets commonly split "Main Image" from "Additional Images"
// into separate columns, so all matches are merged rather than just the first.
const IMAGE_HEADER_ALIASES = [
  'images', 'image', 'image url', 'image urls',
  'main image', 'main image url', 'main image urls',
  'additional image', 'additional images', 'additional image url', 'additional image urls',
  'all image url', 'all image urls', 'all images',
];

// Columns that carry no useful buyer-facing data — skipped instead of being
// swept into Specifications along with everything else unrecognized.
// "Key Specification(s)" is skipped on request — its text is too unstructured
// across real supplier sheets to import reliably, so it's left for the admin
// to fill in by hand instead of auto-generating a messy row or description.
const IGNORED_HEADER_ALIASES = [
  'product url', 'source url', 'url', 'link',
  'key specification', 'key specifications', 'key specs',
];

// Logistics/export columns land in the product's "Shipping & Payment" tab
// (shippingInfo) instead of "Product Details" (specifications) — same split
// the manual admin form already makes between its Specifications and
// Shipping Details sections.
const SHIPPING_HEADER_ALIASES = [
  'fob port', 'port', 'port of loading',
  'weight per unit', 'unit weight',
  'dimensions per unit', 'unit dimensions',
  'hts code', 'hs code', 'harmonized code', 'harmonized tariff code',
  'units per export carton', 'export carton units', 'pieces per carton',
  'export carton dimension', 'export carton dimensions',
  'export carton weight', 'export carton gross weight',
];

// One column for every field that ends up somewhere on the live product
// page: identity/pricing fields map to their own DB field, "Product URL" is
// kept for the admin's own reference only (never imported), general
// attributes (Brand Name..Shelf Life) land on the "Product Details" tab via
// Specifications, and the last 7 columns land on the "Shipping & Payment"
// tab via shippingInfo. See HEADER_ALIASES / SHIPPING_HEADER_ALIASES above.
export const CSV_TEMPLATE_ROWS = [
  [
    'Product URL', 'Main Image URL', 'Additional Image URLs',
    'Title', 'Slug', 'Model Number', 'Category', 'Collections',
    'Price (per Ton)', 'Price Unit', 'Old Price', 'MOQ', 'Lead Time',
    'Badge', 'Tags', 'Status', 'Featured',
    'Short Description', 'Product Description',
    'Brand Name', 'Origin / Country', 'Small Orders Accepted', 'Material', 'Usage',
    'Storage Temperature', 'Packaging Type', 'Cooking Methods', 'Shelf Life', 'Specifications',
    'FOB Port', 'Weight per Unit', 'Dimensions per Unit', 'HTS Code',
    'Units per Export Carton', 'Export Carton Dimension', 'Export Carton Weight',
  ],
  [
    'https://www.globalsources.com/premium-basmati-rice.html',
    'https://example.com/rice-main.jpg',
    'https://example.com/rice-2.jpg | https://example.com/rice-3.jpg',
    'Premium Basmati Rice 1121 Sella', '', 'RICE-1121', 'Agriculture Product', '',
    '850', '', '', '10 Tons', '15-20 days',
    'NEW', 'weeklyFeatured', 'active', 'true',
    'Long grain aged basmati rice, export grade.',
    '<p>Premium 1121 Sella basmati rice, aged 12 months for extra length and aroma.</p>',
    'Elaff', 'Pakistan', 'Yes', '100% Basmati Rice', 'Retail & Foodservice',
    'Cool & Dry, below 25°C', '25kg PP Bags', 'Boiling, Steaming', '24 Months',
    'Grain Length: 8.2mm | Moisture: 12% Max',
    'Port Qasim, Karachi', '25 kg', '60 x 40 x 10 cm', '1006.30',
    '1 Bag', '60 x 40 x 10 cm', '25 kg',
  ],
];

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function buildTemplateCsv() {
  return CSV_TEMPLATE_ROWS.map((row) => row.map(csvEscape).join(',')).join('\n');
}

function normalizeHeader(header) {
  return header.toLowerCase().trim().replace(/\s+/g, ' ');
}

// Pulls one field out by exact header match (after normalizing case/spacing)
// and remembers which raw header satisfied it, so leftover-column mapping
// further down doesn't double-count it as a spec.
function takeField(rawRow, keys, consumed) {
  for (const [header, value] of Object.entries(rawRow)) {
    if (consumed.has(header)) continue;
    if (keys.includes(normalizeHeader(header))) {
      consumed.add(header);
      return value;
    }
  }
  return '';
}

// "Price", "Price (per Ton)", "Price per Carton", "Unit Price" all count —
// but not a dedicated Price Unit/Old Price column, which are consumed separately.
function takePriceField(rawRow, consumed) {
  for (const [header, value] of Object.entries(rawRow)) {
    if (consumed.has(header)) continue;
    const normalized = normalizeHeader(header);
    if (/\bprice\b/.test(normalized) && !normalized.includes('unit') && !normalized.includes('old')) {
      consumed.add(header);
      return { header, value };
    }
  }
  return { header: '', value: '' };
}

// Recovers a unit like "Ton" out of a header such as "Price (per Ton)" so it
// can seed Price Unit when the sheet has no separate unit column of its own.
function extractUnitFromHeader(header) {
  const match = header.match(/\(([^)]+)\)/);
  if (!match) return '';
  const unit = match[1].trim().replace(/^per\s+/i, '');
  return unit ? `/ ${unit}` : '';
}

// Pulls out recognized shipping/export columns (FOB Port, HTS Code, carton
// dimensions, etc.) as their own label/value rows, consuming them so the
// leftover-column sweep below doesn't also drop them into Specifications.
function takeShippingRows(rawRow, consumed) {
  const rows = [];
  for (const [header, value] of Object.entries(rawRow)) {
    if (consumed.has(header)) continue;
    if (SHIPPING_HEADER_ALIASES.includes(normalizeHeader(header))) {
      const val = String(value ?? '').trim();
      consumed.add(header);
      if (val) rows.push({ label: header.trim(), value: val });
    }
  }
  return rows;
}

function takeImageUrls(rawRow, consumed) {
  const urls = [];
  for (const [header, value] of Object.entries(rawRow)) {
    if (consumed.has(header)) continue;
    if (IMAGE_HEADER_ALIASES.includes(normalizeHeader(header))) {
      consumed.add(header);
      urls.push(...splitUrls(value));
    }
  }
  return [...new Set(urls)];
}

// Splits on pipe/comma/whitespace runs — real sheets paste multiple image
// URLs into one cell separated by plain spaces, not just commas or pipes.
function splitUrls(value) {
  if (!value) return [];
  return String(value)
    .split(/[|,\s]+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
}

function splitList(value) {
  if (!value) return [];
  const str = String(value).trim();
  if (!str) return [];
  const parts = str.includes('|') ? str.split('|') : str.split(',');
  return parts.map((s) => s.trim()).filter(Boolean);
}

// Splits a specifications cell into clean label/value rows. Real supplier
// cells mix obvious "Label: Value" lines with prose intros and bullet lists
// that have no key of their own, and sometimes have no delimiter at all
// (nutritional-analysis lines like "Protein Content 44% min"). Only a line
// that clearly looks like "Label: Value" becomes its own row — everything
// else is kept verbatim in one fallback row instead of being dropped or
// mis-split, so nothing silently disappears and it can be re-split by hand.
const BULLET_PREFIX = /^[\s*•-]+/;
const MAX_LABEL_LENGTH = 40;

function splitSpecLines(text) {
  if (text.includes('\n')) return text.split('\n');
  if (text.includes('|')) return text.split('|');
  if (text.includes(',')) {
    const candidates = text.split(',');
    const nonBlank = candidates.map((c) => c.trim()).filter(Boolean);
    const looksStructured =
      nonBlank.length > 0 &&
      nonBlank.every((c) => {
        const idx = c.indexOf(':');
        return idx > 0 && idx <= MAX_LABEL_LENGTH;
      });
    if (looksStructured) return candidates;
  }
  return [text];
}

// Returns the clean label/value rows plus any prose that had no key of its
// own (joined into one block) — callers decide where that leftover text
// goes (it reads far better as a description than as a table row).
function parseSpecifications(value) {
  if (!value) return { rows: [], leftoverText: '' };
  const text = String(value).trim();
  if (!text) return { rows: [], leftoverText: '' };

  const rows = [];
  const leftover = [];

  for (const rawLine of splitSpecLines(text)) {
    const line = rawLine.replace(BULLET_PREFIX, '').trim();
    if (!line) continue;

    const idx = line.indexOf(':');
    if (idx > 0 && idx <= MAX_LABEL_LENGTH) {
      const label = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (label && val) {
        rows.push({ label, value: val });
        continue;
      }
    }
    leftover.push(line);
  }

  return { rows, leftoverText: leftover.join(' ') };
}

function parseFeatured(value) {
  return ['true', 'yes', '1', 'y'].includes(String(value ?? '').trim().toLowerCase());
}

function parseStatus(value) {
  return String(value ?? '').trim().toLowerCase() === 'draft' ? 'draft' : 'active';
}

// Maps one raw row (from Papa.parse or XLSX.utils.sheet_to_json, both give
// header-keyed objects) into the canonical shape the import API expects.
// Any column that isn't recognized as one of the fields above — Brand Name,
// Origin/Country, FOB Port, Packaging Type, whatever a supplier sheet has —
// becomes its own row in Specifications instead of being silently dropped.
export function normalizeImportRow(rawRow) {
  const consumed = new Set();

  const title = String(takeField(rawRow, HEADER_ALIASES.title, consumed) || '').trim();
  const slug = String(takeField(rawRow, HEADER_ALIASES.slug, consumed) || '').trim();
  const sku = String(takeField(rawRow, HEADER_ALIASES.sku, consumed) || '').trim();
  const category = String(takeField(rawRow, HEADER_ALIASES.category, consumed) || '').trim();
  const collectionNames = splitList(takeField(rawRow, HEADER_ALIASES.collections, consumed));

  const oldPrice = String(takeField(rawRow, HEADER_ALIASES.oldPrice, consumed) || '').trim();
  const explicitPriceUnit = String(takeField(rawRow, HEADER_ALIASES.priceUnit, consumed) || '').trim();
  const { header: priceHeader, value: priceRaw } = takePriceField(rawRow, consumed);
  const price = String(priceRaw || '').trim();
  const priceUnit = explicitPriceUnit || (priceHeader ? extractUnitFromHeader(priceHeader) : '');

  const moqValue = String(takeField(rawRow, HEADER_ALIASES.moq, consumed) || '').trim();
  const moqUnit = String(takeField(rawRow, HEADER_ALIASES.moqUnit, consumed) || '').trim();

  const leadTime = String(takeField(rawRow, HEADER_ALIASES.leadTime, consumed) || '').trim();
  const badge = String(takeField(rawRow, HEADER_ALIASES.badge, consumed) || '').trim();
  const tags = splitList(takeField(rawRow, HEADER_ALIASES.tags, consumed));
  const status = parseStatus(takeField(rawRow, HEADER_ALIASES.status, consumed));
  const featured = parseFeatured(takeField(rawRow, HEADER_ALIASES.featured, consumed));
  const shortDescription = String(takeField(rawRow, HEADER_ALIASES.shortDescription, consumed) || '').trim();
  const explicitFullDescription = String(takeField(rawRow, HEADER_ALIASES.fullDescription, consumed) || '').trim();
  const images = takeImageUrls(rawRow, consumed);
  const { rows: specifications, leftoverText } = parseSpecifications(
    takeField(rawRow, HEADER_ALIASES.specifications, consumed)
  );
  // Prose with no key of its own (an intro paragraph, a bullet list) reads far
  // better as the product description than crammed into one giant spec row —
  // but a real Description column, when present, always wins.
  const fullDescription = explicitFullDescription || leftoverText;
  const shippingInfo = takeShippingRows(rawRow, consumed);

  // Everything left over — one spec row per remaining non-empty column, in sheet order.
  for (const [header, value] of Object.entries(rawRow)) {
    if (consumed.has(header)) continue;
    if (IGNORED_HEADER_ALIASES.includes(normalizeHeader(header))) continue;
    const val = String(value ?? '').trim();
    if (!val) continue;
    specifications.push({ label: header.trim(), value: val });
  }

  return {
    title,
    slug,
    sku,
    category,
    collectionNames,
    price,
    priceUnit,
    oldPrice,
    moq: moqUnit ? `${moqValue} ${moqUnit}`.trim() : moqValue,
    leadTime,
    badge,
    tags,
    status,
    featured,
    shortDescription,
    fullDescription,
    images,
    specifications,
    shippingInfo,
  };
}
