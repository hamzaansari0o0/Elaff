// Short "direct answer" paragraphs (30 to 50 words) placed near the top of a
// page: the kind of self-contained answer Google's featured snippets, voice
// assistants and AI answer engines quote. Like the FAQs, nothing is invented:
// the fixed wording restates what the site already says, and product and
// collection answers use real names, counts and stored fields, leaving out
// whatever is missing. Plain functions, tested for the word range.
// (Imports carry a ".js" extension so Node's test runner can load this file.)
import { COMPANY_DESCRIPTION } from './seo.js';

const MIN_WORDS = 30;
const MAX_WORDS = 50;

const clean = (value) => (typeof value === 'string' ? value.trim() : '');

// Words as a reader would count them: stray symbols like "&" or "—" don't count.
export function countWords(text) {
  return String(text ?? '')
    .split(/\s+/)
    .filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

// Sources: About > Core Advantages, Footer.
export function homeAnswer() {
  return `${COMPANY_DESCRIPTION} Minimum orders start at one pallet, and we ship orders within 24 to 72 hours.`;
}

// Sources: About > Who We Are, Our Service.
export function aboutAnswer() {
  return 'Elaff Trade Co. is a global B2B trading company handling import, export, wholesale and distribution for wholesalers, distributors and retailers worldwide. We provide cross-border procurement, international logistics and warehousing, customs clearance and delivery, on EXW, FOB or CNF terms.';
}

// Source: the Partners page's own introduction.
export function partnersAnswer() {
  return 'Elaff Trade Co. works directly with FMCG brands across grocery, personal care, confectionery and beverages, sourcing, distributing and delivering their products to businesses worldwide. The brand logos below show some of the brands we handle for wholesale and export buyers.';
}

export function collectionAnswer(collection, productCount) {
  const title = clean(collection?.title);
  const count = Number(productCount) > 0 ? Math.floor(Number(productCount)) : 0;

  const stock = count > 0
    ? `Elaff Trade Co. lists ${count} ${count === 1 ? 'product' : 'products'} in this collection for wholesale and export.`
    : 'Elaff Trade Co. supplies this category for wholesale and export, so please ask about current stock.';

  return `${title} is a product collection for wholesalers, distributors and retailers. ${stock} Each product page shows its minimum order and lead time where available, and you can send an inquiry for prices.`;
}

// Marketplace-style product titles can run to 60 words of keywords
// ("... Wholesale | Buy ... In Bulk | ... Supplier"). In a sentence, use the part
// before the first separator, and at most 10 words of it.
const MAX_NAME_WORDS = 10;
function shortName(title) {
  const first = title.split(/\s[|/–—-]\s|,\s/)[0].trim() || title;
  const words = first.split(/\s+/);
  return words.length > MAX_NAME_WORDS ? `${words.slice(0, MAX_NAME_WORDS).join(' ')}…` : first;
}

// `collectionTitle` is the product's first collection, if it has one.
export function productAnswer(product, collectionTitle) {
  const title = shortName(clean(product?.title));
  const collection = clean(collectionTitle);
  const moq = clean(product?.moq);
  const leadTime = clean(product?.leadTime);
  const description = clean(product?.shortDescription);

  const required = [
    `${title} is a wholesale product${collection ? ` in our ${collection} collection` : ''}, supplied in bulk by Elaff Trade Co. for wholesalers, distributors and retailers.`,
    'We ship worldwide on EXW, FOB or CNF terms.',
    'Send an inquiry for current prices, packaging and shipping terms.',
  ];
  // Added in this order, each only if the answer stays within the limit.
  const optional = [
    moq && `Minimum order: ${moq}.`,
    leadTime && `Lead time: ${leadTime}.`,
    description && (/[.!?]$/.test(description) ? description : `${description}.`),
  ].filter(Boolean);

  let sentences = required;
  // The long names some products have can push the required text past the limit: drop the shipping sentence first.
  if (countWords(sentences.join(' ')) > MAX_WORDS) sentences = [required[0], required[2]];

  for (const extra of optional) {
    const candidate = [...sentences.slice(0, -1), extra, sentences.at(-1)];
    if (countWords(candidate.join(' ')) <= MAX_WORDS) sentences = candidate;
  }

  const text = sentences.join(' ');
  return countWords(text) >= MIN_WORDS ? text : `${text} ${required[1]}`.trim();
}
