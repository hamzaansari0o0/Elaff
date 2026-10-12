// Shared SEO helpers: the canonical site URL, the one company description that
// every machine-readable surface repeats, and builders for schema.org JSON-LD
// nodes. Pure functions only (no DB, no React) so server components, route
// handlers and the tests can all import this file.
//
// Builders return plain objects with blank values already removed, and point at
// the Organization / WebSite nodes by @id instead of repeating them, so the
// nodes on a page link up into one graph that an AI crawler can follow.

export const SITE_NAME = 'Elaff Trade Co.';

// The single answer to "what does this company do?". Meta descriptions, JSON-LD
// and llms.txt all reuse it, so Google and AI engines see one consistent
// description instead of several slightly different ones.
export const COMPANY_DESCRIPTION =
  'Elaff Trade Co. is a B2B trading company that sources and exports FMCG products (grocery, snacks, confectionery, beverages, frozen and agricultural goods) for wholesalers, distributors and retailers worldwide.';

// Official profiles (LinkedIn, Facebook, Alibaba, ...) reported as `sameAs` on
// the Organization — the strongest signal that ties our site to the same
// company elsewhere on the web. Empty until the real URLs are supplied.
export const SOCIAL_PROFILES = [];

// The <title> of any page that doesn't set its own (the home page), and the
// title shared in link previews for it. Keep it near 60 characters.
export const HOME_TITLE = 'Elaff Trade Co. | B2B Wholesale FMCG, Food & Grocery Supplier';

// Every other page passes just its own title ("About Us"); the root layout adds
// the brand. Used both there and when building share-card titles below.
export const TITLE_TEMPLATE = `%s | ${SITE_NAME}`;

// Short form of COMPANY_DESCRIPTION for meta descriptions — search results show
// roughly 160 characters.
export const SITE_DESCRIPTION =
  'B2B trading company sourcing and exporting grocery, confectionery, beverages, frozen and agricultural products for wholesalers and distributors worldwide.';

// The blog's list page (/blog): its title (the layout adds the brand), its meta
// description (search results show roughly 155 characters), and the same two
// as published in the Blog structured data.
export const BLOG_TITLE = 'Wholesale Food Import & Sourcing Guides';
export const BLOG_DESCRIPTION =
  'Practical guides for importers and wholesale buyers: frozen food, fresh fruit, trade terms, halal and HACCP, shipping and choosing a supplier.';

// Shown in link previews (WhatsApp, LinkedIn, Facebook, X) for pages without a
// picture of their own. The logo is transparent, which previews often paint
// black, so this is the logo centred on white at the standard 1200x630.
const DEFAULT_SHARE_IMAGE = { url: '/og-default.png', width: 1200, height: 630, alt: SITE_NAME };

// The social-tag fields that are the same on every page. The root layout uses
// these as defaults for any page that sets no social tags of its own. No title
// or description here on purpose: Next fills those in from each page's own.
export const SOCIAL_DEFAULTS = {
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'en_US', images: [DEFAULT_SHARE_IMAGE] },
  twitter: { card: 'summary_large_image', images: [DEFAULT_SHARE_IMAGE.url] },
};

const META_DESCRIPTION_MAX = 155;

const LANGUAGE = 'en';

// formatPrice() renders every price with a "$", so offers are in US dollars.
const PRICE_CURRENCY = 'USD';

// Keeps a collection's ItemList small even when a collection holds hundreds of products.
const MAX_LIST_ITEMS = 100;

// NEXT_PUBLIC_SITE_URL must be the real production domain (set it in .env /
// the hosting dashboard). Without it every canonical URL and sitemap entry
// points at localhost, so production builds warn loudly instead of failing.
const configuredSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();

function resolveSiteUrl() {
  const raw = configuredSiteUrl;

  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        'NEXT_PUBLIC_SITE_URL is not set: the sitemap, JSON-LD and link-preview images will point at http://localhost:3000, and canonical URLs are left out. Set it to the real domain in your hosting environment variables.'
      );
    }
    return 'http://localhost:3000';
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}

export const SITE_URL = resolveSiteUrl();

// A canonical, og:url, sitemap entry or robots.txt sitemap line that resolves
// to localhost tells search engines the page lives somewhere they can't reach —
// worse than having none. So a production build without NEXT_PUBLIC_SITE_URL
// leaves them all out (while still warning above). Development keeps them,
// for testing.
export const CAN_ADDRESS_PAGES = configuredSiteUrl !== '' || process.env.NODE_ENV !== 'production';

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

// Turns a site path into a full URL. Already-absolute URLs (e.g. Cloudinary
// images) are returned untouched.
export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Admin-entered text: trimmed, or undefined when it's blank.
function text(value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || undefined;
}

// Drops blank values (undefined, null, '', empty lists/objects) so a field the
// admin left empty never reaches the page as an empty string — Search Console
// reports those as invalid.
function compact(value) {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter((item) => item !== undefined);
    return items.length > 0 ? items : undefined;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compact(item)])
      .filter(([, item]) => item !== undefined);
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }
  return value === null || value === undefined || value === '' ? undefined : value;
}

// JSON.stringify doesn't escape "<", so text like "</script>" in a product
// title would end the script tag early. Escaping "<" is the fix the Next.js
// docs recommend for JSON-LD.
export function serializeJsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

const HTML_ENTITIES = { '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&amp;': '&' };

// Plain text from admin-entered HTML (e.g. a product's full description).
// Tags become spaces so neighbouring words don't run together; entities are
// decoded in a single pass so "&amp;lt;" can't turn into "<".
export function stripHtml(html = '') {
  return String(html ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/?[a-z][^>]*>/gi, ' ')
    .replace(/&(?:nbsp|lt|gt|quot|#39|amp);/g, (entity) => HTML_ENTITIES[entity])
    .replace(/\s+/g, ' ')
    .trim();
}

// Shortens text to at most `max` characters, cutting between words and ending
// with an ellipsis. A single word longer than the limit is cut hard.
export function truncate(text, max) {
  if (text.length <= max) return text;

  const slice = text.slice(0, max - 1);
  const cutsBetweenWords = /\s/.test(text[max - 1]);
  const wholeWords = cutsBetweenWords ? slice : slice.replace(/\s+\S*$/, '');
  return `${wholeWords.replace(/[\s,;:.\-–—]+$/, '')}…`;
}

// A meta description for a page: the first candidate that has any text, as
// plain text, short enough that a search result won't cut it off mid-sentence.
// Pass the best source first (e.g. the admin's short description) and a
// generated sentence last.
export function metaDescription(...candidates) {
  for (const candidate of candidates) {
    const plain = stripHtml(candidate);
    if (plain) return truncate(plain, META_DESCRIPTION_MAX);
  }
  return undefined;
}

// The admin's address box is multi-line; schema.org wants one street line.
function flattenLines(value) {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(', ');
}

// `settings` is the CompanySettings document edited in Admin > Settings.
export function organizationLd(settings = {}) {
  const postalAddress = compact({
    streetAddress: flattenLines(settings.address),
    addressCountry: text(settings.country),
  });
  const contact = compact({ telephone: text(settings.phone), email: text(settings.email) });
  const year = text(settings.yearEstablished);

  return compact({
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: text(settings.companyName) || SITE_NAME,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/logo.png'),
    description: COMPANY_DESCRIPTION,
    email: text(settings.email),
    telephone: text(settings.phone),
    foundingDate: /^\d{4}$/.test(year || '') ? year : undefined,
    address: postalAddress ? { '@type': 'PostalAddress', ...postalAddress } : undefined,
    areaServed: (settings.exportMarkets || []).map(text),
    knowsAbout: (settings.mainProducts || []).map(text),
    sameAs: SOCIAL_PROFILES,
    contactPoint: contact ? { '@type': 'ContactPoint', contactType: 'sales', ...contact } : undefined,
  });
}

export function websiteLd(settings = {}) {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: absoluteUrl('/'),
    name: text(settings.companyName) || SITE_NAME,
    description: COMPANY_DESCRIPTION,
    inLanguage: LANGUAGE,
    publisher: { '@id': ORGANIZATION_ID },
    // Describes the storefront's own search box (/shop?search=...) to machines.
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/shop?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

// A page of the site. `type` can be a more specific schema.org page type such
// as AboutPage, ContactPage or CollectionPage.
export function webPageLd({ type = 'WebPage', path, name, description, about }) {
  const url = absoluteUrl(path);
  return compact({
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: LANGUAGE,
    isPartOf: { '@id': WEBSITE_ID },
    about,
  });
}

export function serviceLd({ name, description, serviceType, areaServed }) {
  return compact({
    '@type': 'Service',
    name,
    description,
    serviceType,
    provider: { '@id': ORGANIZATION_ID },
    areaServed,
  });
}

// `items` is a trail of { name, path }, from the home page down to the current page.
export function breadcrumbLd(items) {
  if (!items?.length) return undefined;

  return compact({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  });
}

function offerLd(product, url) {
  // Inquiry-only products have no price, so there is no offer to describe.
  if (!(product.price > 0)) return undefined;

  const offer = { '@type': 'Offer', url, priceCurrency: PRICE_CURRENCY, seller: { '@id': ORGANIZATION_ID } };
  const unit = text(String(product.priceUnit ?? '').replace(/^\s*\/\s*/, ''));

  // "$205 / ton" must not be read as "$205 for one item", so a price quoted
  // per unit is only ever given as a unit price specification.
  if (unit) {
    return {
      ...offer,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: product.price,
        priceCurrency: PRICE_CURRENCY,
        unitText: unit,
      },
    };
  }
  return { ...offer, price: product.price };
}

// The facts a buyer asks about, as name/value pairs an AI engine can quote.
function additionalProperties(product) {
  const rows = [
    ...(product.specifications || []),
    ...(product.shippingInfo || []),
    { label: 'Minimum order quantity', value: product.moq },
    { label: 'Lead time', value: product.leadTime },
  ];

  return rows
    .filter((row) => text(row.label) && text(row.value))
    .map((row) => ({ '@type': 'PropertyValue', name: text(row.label), value: text(row.value) }));
}

// `product` is a serialized Product document (see lib/products.js).
export function productLd(product) {
  const url = absoluteUrl(`/product/${product.slug}`);

  return compact({
    '@type': 'Product',
    '@id': `${url}#product`,
    url,
    name: text(product.title),
    description: text(product.shortDescription) || text(stripHtml(product.fullDescription)),
    sku: text(product.sku),
    category: text(product.category) || text(product.collections?.[0]?.title),
    image: (product.images || []).map(text).filter(Boolean).map((src) => absoluteUrl(src)),
    additionalProperty: additionalProperties(product),
    offers: offerLd(product, url),
  });
}

export function collectionLd(collection, products) {
  const items = products.slice(0, MAX_LIST_ITEMS);

  return compact({
    ...webPageLd({
      type: 'CollectionPage',
      path: `/collection/${collection.slug}`,
      name: text(collection.title),
      description: text(collection.description),
    }),
    mainEntity: items.length
      ? {
          '@type': 'ItemList',
          numberOfItems: items.length,
          itemListElement: items.map((product, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/product/${product.slug}`),
            name: product.title,
          })),
        }
      : undefined,
  });
}

// `items` is a list of { question, answer } in plain text, matching what the
// page shows on screen.
export function faqLd(items, path) {
  if (!items?.length) return undefined;

  const url = absoluteUrl(path);
  return compact({
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    url,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  });
}

// The company as the author or publisher of an article. Google's article
// checks want a name and address on the node itself, and may not join it to the
// Organization in the layout's separate script tag, so the essentials are
// repeated here under the same @id.
function organizationRole(settings, extra) {
  return compact({
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: text(settings?.companyName) || SITE_NAME,
    url: absoluteUrl('/'),
    ...extra,
  });
}

// `article` comes from lib/blogParse.js. `settings` is Company Settings.
export function articleLd(article, settings) {
  const url = absoluteUrl(`/blog/${article.slug}`);

  return compact({
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: text(article.title),
    description: text(article.description),
    datePublished: article.date,
    dateModified: article.updated,
    inLanguage: LANGUAGE,
    keywords: [article.keyword, ...(article.keywords || [])].map(text).filter(Boolean).join(', '),
    wordCount: article.wordCount,
    image: [absoluteUrl(DEFAULT_SHARE_IMAGE.url)],
    isPartOf: { '@id': WEBSITE_ID },
    author: organizationRole(settings),
    publisher: organizationRole(settings, { logo: { '@type': 'ImageObject', url: absoluteUrl('/logo.png') } }),
  });
}

// The blog list page: the blog itself and a short entry for each post.
export function blogLd(articles) {
  const url = absoluteUrl('/blog');

  return compact({
    '@type': 'Blog',
    '@id': `${url}#blog`,
    url,
    name: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    inLanguage: LANGUAGE,
    isPartOf: { '@id': WEBSITE_ID },
    publisher: { '@id': ORGANIZATION_ID },
    blogPost: articles.map((article) => ({
      '@type': 'BlogPosting',
      headline: text(article.title),
      url: absoluteUrl(`/blog/${article.slug}`),
      datePublished: article.date,
      dateModified: article.updated,
    })),
  });
}

// Missing nodes (e.g. an FAQ with no questions) are skipped rather than
// emitted as null.
export function jsonLdGraph(nodes) {
  return { '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) };
}

// What goes inside a page's <script type="application/ld+json"> tag: one node
// or a list of nodes as a single serialized graph, or null when there is
// nothing to describe (so the page renders no empty script at all).
export function jsonLdHtml(nodes) {
  // Every id and URL in the nodes would be localhost without a real site URL.
  if (!CAN_ADDRESS_PAGES) return null;

  const graph = jsonLdGraph([nodes].flat());
  return graph['@graph'].length > 0 ? serializeJsonLd(graph) : null;
}

// Open Graph and Twitter tags (link previews on WhatsApp, LinkedIn, Facebook,
// X). Next replaces — it does not merge — a layout's `openGraph` with a page's,
// so every page must supply a complete set; this builds one. `title` is the
// bare page title; none means the home page.
function socialMetadata({ title, description, path, image, article }) {
  const pageImage = text(image);
  const socialTitle = title ? TITLE_TEMPLATE.replace('%s', () => title) : HOME_TITLE;

  return compact({
    openGraph: {
      ...SOCIAL_DEFAULTS.openGraph,
      ...(article && {
        type: 'article',
        publishedTime: article.publishedTime,
        modifiedTime: article.modifiedTime,
      }),
      title: socialTitle,
      description,
      url: CAN_ADDRESS_PAGES ? path : undefined,
      ...(pageImage && { images: [{ url: pageImage, alt: title || SITE_NAME }] }),
    },
    twitter: {
      ...SOCIAL_DEFAULTS.twitter,
      title: socialTitle,
      description,
      ...(pageImage && { images: [pageImage] }),
    },
  });
}

// The metadata every storefront page exports: its title and description, its
// canonical address (so the same page reached by other URLs counts as one) and
// the social tags. `title` is passed bare — the layout's template adds the
// brand — and left out for the home page, which uses the layout's default.
//
// `noindex` keeps a page out of search results (it can still be followed for
// links). Such a page gets no canonical or og:url: pointing a noindex page at
// an address is a mixed signal.
//
// `article` ({ publishedTime, modifiedTime }) marks a blog article: link
// previews then see an article, with its dates, instead of a generic website page.
export function pageMetadata({ title, description, path, image, noindex = false, article }) {
  const address = noindex ? undefined : path;

  return compact({
    title,
    description,
    alternates: { canonical: CAN_ADDRESS_PAGES ? address : undefined },
    robots: noindex ? { index: false, follow: true } : undefined,
    ...socialMetadata({ title, description, path: address, image, article }),
  });
}

// Which address a view of /shop should be indexed under, or that it should stay
// out of the index. One URL serves many views (all products, a collection,
// search results, a tag list, other sort orders, page N), so left alone every
// ?sort=, ?search=, ?tag= and ?collection= variant would be indexed as its own
// near-duplicate page. Follows the page's own precedence: search, then
// collection, then tag. Returns { path } or { noindex: true }.
export function shopIndexing({ search, collection, collectionFound, tag, sort, page }) {
  if (search) return { noindex: true }; // internal search results

  if (collection) {
    // The collection's own page already lists these products, so this view
    // counts as that page — whatever the page number or sort order.
    return collectionFound ? { path: `/collection/${encodeURIComponent(collection)}` } : { noindex: true };
  }

  if (tag) return { noindex: true }; // curated lists (on sale, bestsellers) that change over time
  if (sort && sort !== 'featured') return { noindex: true }; // the same products in another order

  const pageNumber = parseInt(page, 10);
  return { path: pageNumber > 1 ? `/shop?page=${pageNumber}` : '/shop' };
}
