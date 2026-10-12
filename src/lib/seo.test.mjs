import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

// seo.js reads NEXT_PUBLIC_SITE_URL once, when it is first imported (the same
// way the sitemap and robots routes do). Each scenario that cares about the
// env therefore imports its own copy of the module — the query string makes
// Node treat it as a brand-new module.
let copies = 0;
async function loadSeo(siteUrl, nodeEnv = 'test') {
  if (siteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = siteUrl;
  process.env.NODE_ENV = nodeEnv;
  return import(`./seo.js?copy=${copies++}`);
}

const seo = await loadSeo('https://www.example.com/');
const {
  absoluteUrl,
  serializeJsonLd,
  stripHtml,
  organizationLd,
  websiteLd,
  webPageLd,
  serviceLd,
  breadcrumbLd,
  productLd,
  collectionLd,
  faqLd,
  articleLd,
  blogLd,
  jsonLdGraph,
  jsonLdHtml,
  truncate,
  metaDescription,
  pageMetadata,
  shopIndexing,
} = seo;

// Walks a finished JSON-LD node and fails on any blank value (empty string,
// empty list/object, null) — Search Console reports those as invalid fields.
function assertNoEmptyValues(value, path = 'node') {
  assert.notEqual(value, undefined, `${path} is undefined`);
  assert.notEqual(value, null, `${path} is null`);
  assert.notEqual(value, '', `${path} is an empty string`);
  if (Array.isArray(value)) {
    assert.ok(value.length > 0, `${path} is an empty array`);
    value.forEach((item, i) => assertNoEmptyValues(item, `${path}[${i}]`));
  } else if (typeof value === 'object') {
    const entries = Object.entries(value);
    assert.ok(entries.length > 0, `${path} is an empty object`);
    entries.forEach(([key, item]) => assertNoEmptyValues(item, `${path}.${key}`));
  }
}

function makeProducts(count) {
  return Array.from({ length: count }, (_, i) => ({ title: `Item ${i + 1}`, slug: `item-${i + 1}` }));
}

describe('site URL handling', () => {
  test('absoluteUrl joins paths onto the site URL without doubled or missing slashes', () => {
    const cases = [
      [undefined, 'https://www.example.com/'],
      ['/', 'https://www.example.com/'],
      ['/product/rice', 'https://www.example.com/product/rice'],
      ['product/rice', 'https://www.example.com/product/rice'],
      ['/shop?page=2', 'https://www.example.com/shop?page=2'],
    ];
    for (const [path, want] of cases) assert.equal(absoluteUrl(path), want);
  });

  test('absoluteUrl leaves already-absolute URLs (hosted images) alone', () => {
    const url = 'https://res.cloudinary.com/demo/image/upload/v1/rice.jpg';
    assert.equal(absoluteUrl(url), url);
  });

  test('NEXT_PUBLIC_SITE_URL is normalised: trailing slashes dropped, https assumed, localhost as the fallback', async () => {
    const cases = [
      ['https://www.example.com//', 'https://www.example.com/x'],
      ['www.example.com', 'https://www.example.com/x'],
      [undefined, 'http://localhost:3000/x'],
    ];
    for (const [env, want] of cases) {
      const { absoluteUrl: abs } = await loadSeo(env);
      assert.equal(abs('/x'), want, `NEXT_PUBLIC_SITE_URL=${env}`);
    }
  });

  test('a missing NEXT_PUBLIC_SITE_URL warns in production builds, and only there', async (t) => {
    const warn = t.mock.method(console, 'warn', () => {});
    const cases = [
      ['production', undefined, 1],
      ['production', 'https://www.example.com', 0],
      ['development', undefined, 0],
    ];
    for (const [nodeEnv, env, want] of cases) {
      warn.mock.resetCalls();
      await loadSeo(env, nodeEnv);
      assert.equal(warn.mock.callCount(), want, `NODE_ENV=${nodeEnv} NEXT_PUBLIC_SITE_URL=${env}`);
      if (want) assert.match(String(warn.mock.calls[0].arguments[0]), /NEXT_PUBLIC_SITE_URL/);
    }
  });
});

describe('serializeJsonLd', () => {
  test('data containing </script> cannot break out of the script tag', () => {
    const data = { name: 'Rice </script><script>alert(1)</script>' };
    const out = serializeJsonLd(data);
    assert.ok(!out.includes('<'), 'a raw "<" would let admin-entered text close the script tag');
    assert.deepEqual(JSON.parse(out), data);
  });
});

describe('stripHtml', () => {
  test('removes tags without gluing words together and decodes common entities', () => {
    const cases = [
      ['<p>Fish&nbsp;&amp;&nbsp;chips</p><ul><li>One</li><li>Two</li></ul>', 'Fish & chips One Two'],
      ['3 < 5 and 7 > 2', '3 < 5 and 7 > 2'],
      ['Tea &lt;b&gt; leaf', 'Tea <b> leaf'],
      ['', ''],
      [undefined, ''],
      [null, ''],
    ];
    for (const [html, want] of cases) assert.equal(stripHtml(html), want);
  });
});

describe('truncate', () => {
  test('leaves text that already fits untouched', () => {
    assert.equal(truncate('Frozen chicken wings', 20), 'Frozen chicken wings');
  });

  test('cuts between words, ends with an ellipsis and never exceeds the limit', () => {
    const text = 'The quick brown fox jumps over the lazy dog';
    const cases = [
      [20, 'The quick brown fox…'], // the cut falls exactly between two words
      [22, 'The quick brown fox…'], // the cut would land inside "jumps"
      [10, 'The quick…'],
      [5, 'The…'],
    ];
    for (const [max, want] of cases) {
      const out = truncate(text, max);
      assert.equal(out, want, `max=${max}`);
      assert.ok(out.length <= max, `max=${max} but got ${out.length} characters`);
    }
  });

  test('drops punctuation that would be left dangling before the ellipsis', () => {
    assert.equal(truncate('Hello world, this is a long sentence', 14), 'Hello world…');
  });

  test('hard-cuts a single word that is longer than the limit', () => {
    assert.equal(truncate('Supercalifragilisticexpialidocious', 10), 'Supercali…');
  });
});

describe('metaDescription', () => {
  test('uses the first non-blank candidate, as plain text', () => {
    assert.equal(
      metaDescription('', '  ', '<p>Frozen <b>chicken</b> wings</p>', 'fallback'),
      'Frozen chicken wings'
    );
  });

  test('shortens long text to fit a search-result snippet without splitting a word', () => {
    const out = metaDescription('word '.repeat(100));
    assert.ok(out.length <= 160, `${out.length} characters is too long for a snippet`);
    assert.ok(out.endsWith('…'));
    assert.ok(out.slice(0, -1).split(' ').every((token) => token === 'word'), 'a word was cut in half');
  });

  test('returns undefined when every candidate is blank', () => {
    assert.equal(metaDescription(undefined, null, '', '<p> </p>'), undefined);
  });
});

describe('page metadata', () => {
  const page = pageMetadata({ title: 'About Us', description: 'Who we are.', path: '/about' });

  test('passes the bare title through so the layout template adds the brand exactly once', () => {
    assert.equal(page.title, 'About Us');
  });

  test('every page is canonical to its own path', () => {
    assert.equal(page.alternates.canonical, '/about');
  });

  test('social tags are complete, because a page replaces (not merges) the layout\'s openGraph', () => {
    const { openGraph, twitter } = page;
    assert.equal(openGraph.title, 'About Us | Elaff Trade Co.');
    assert.equal(openGraph.description, 'Who we are.');
    assert.equal(openGraph.url, '/about');
    assert.equal(openGraph.siteName, 'Elaff Trade Co.');
    assert.equal(openGraph.type, 'website');
    assert.equal(twitter.card, 'summary_large_image');
    assert.equal(twitter.title, 'About Us | Elaff Trade Co.');
    assert.equal(twitter.description, 'Who we are.');
  });

  test('a title containing "$$" reaches the social tags unchanged', () => {
    const { openGraph, twitter } = pageMetadata({ title: 'Save $$ Now', description: 'd', path: '/x' });
    assert.equal(openGraph.title, 'Save $$ Now | Elaff Trade Co.');
    assert.equal(twitter.title, 'Save $$ Now | Elaff Trade Co.');
  });

  test('the home page has no title of its own: it inherits the layout default and shares that', () => {
    const home = pageMetadata({ description: 'Home.', path: '/' });
    assert.ok(!('title' in home), 'a title here would get the brand appended a second time');
    assert.equal(home.openGraph.title, seo.HOME_TITLE);
    assert.equal(home.alternates.canonical, '/');
  });

  test('uses the default share image unless the page has its own', () => {
    assert.deepEqual(page.openGraph.images, [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Elaff Trade Co.' }]);
    assert.deepEqual(page.twitter.images, ['/og-default.png']);

    const hosted = 'https://res.cloudinary.com/demo/image/upload/v1/rice.jpg';
    const withImage = pageMetadata({ title: 'Rice', description: 'Rice.', path: '/product/rice', image: hosted });
    assert.deepEqual(withImage.openGraph.images, [{ url: hosted, alt: 'Rice' }]);
    assert.deepEqual(withImage.twitter.images, [hosted]);
  });

  test('a blank image (an unset admin field) falls back to the default image', () => {
    const blank = pageMetadata({ title: 'Rice', description: 'Rice.', path: '/product/rice', image: '  ' });
    assert.equal(blank.openGraph.images[0].url, '/og-default.png');
  });

  test('a page kept out of the index says so, and carries no canonical or og:url of its own', () => {
    const cases = [
      { path: undefined }, // e.g. shop search results
      { path: '/product/unfinished-draft' }, // e.g. a draft product, reachable by its URL
    ];
    for (const { path } of cases) {
      const meta = pageMetadata({ title: 'Draft', description: 'd', path, noindex: true });
      assert.deepEqual(meta.robots, { index: false, follow: true }, `path=${path}`);
      assert.ok(!('alternates' in meta), `a canonical on a noindex page is a mixed signal (path=${path})`);
      assert.ok(!('url' in meta.openGraph), `path=${path}`);
    }
  });

  test('indexable pages carry no robots directive at all', () => {
    assert.ok(!('robots' in page));
  });

  test('an article page is typed as an article and says when it was published and changed', () => {
    const article = pageMetadata({
      title: 'Guide',
      description: 'd',
      path: '/blog/guide',
      article: { publishedTime: '2026-10-14', modifiedTime: '2026-10-20' },
    });
    assert.equal(article.openGraph.type, 'article');
    assert.equal(article.openGraph.publishedTime, '2026-10-14');
    assert.equal(article.openGraph.modifiedTime, '2026-10-20');
    assert.equal(article.openGraph.title, 'Guide | Elaff Trade Co.');
    assert.equal(article.openGraph.url, '/blog/guide');
    assert.equal(article.alternates.canonical, '/blog/guide');
    assert.equal(page.openGraph.type, 'website');
    assert.ok(!('publishedTime' in page.openGraph));
  });

  test('a production build without NEXT_PUBLIC_SITE_URL leaves out canonical and og:url rather than pointing at localhost', async (t) => {
    t.mock.method(console, 'warn', () => {});
    const { pageMetadata: build } = await loadSeo(undefined, 'production');
    const meta = build({ title: 'About Us', description: 'd', path: '/about' });
    assert.ok(!('alternates' in meta), 'a localhost canonical tells search engines the page lives somewhere unreachable');
    assert.ok(!('url' in meta.openGraph));
  });

  test('canonical and og:url are present once the site URL is set, and in development', async () => {
    const cases = [
      ['https://www.example.com', 'production'],
      [undefined, 'development'],
    ];
    for (const [env, nodeEnv] of cases) {
      const { pageMetadata: build } = await loadSeo(env, nodeEnv);
      const meta = build({ title: 'About Us', description: 'd', path: '/about' });
      assert.equal(meta.alternates.canonical, '/about', `NEXT_PUBLIC_SITE_URL=${env} NODE_ENV=${nodeEnv}`);
      assert.equal(meta.openGraph.url, '/about', `NEXT_PUBLIC_SITE_URL=${env} NODE_ENV=${nodeEnv}`);
    }
  });

  test("the layout's social defaults name no title, description or address, which would be wrong on most pages", () => {
    const { openGraph, twitter } = seo.SOCIAL_DEFAULTS;
    for (const key of ['title', 'description', 'url']) {
      assert.ok(!(key in openGraph), `openGraph.${key} would be shared by every page that relies on the defaults`);
    }
    assert.ok(!('title' in twitter) && !('description' in twitter));
    assert.equal(openGraph.siteName, 'Elaff Trade Co.');
    assert.equal(openGraph.images[0].url, '/og-default.png');
  });

  test('the default title and description fit what search results display', () => {
    assert.ok(seo.HOME_TITLE.length <= 65, `title is ${seo.HOME_TITLE.length} characters`);
    assert.ok(seo.SITE_DESCRIPTION.length <= 160, `description is ${seo.SITE_DESCRIPTION.length} characters`);
  });
});

describe('shopIndexing', () => {
  test('the plain listing and its numbered pages are indexed under their own address', () => {
    const cases = [
      [{}, { path: '/shop' }],
      [{ page: '1' }, { path: '/shop' }],
      [{ page: '2' }, { path: '/shop?page=2' }],
      [{ page: '12' }, { path: '/shop?page=12' }],
      [{ page: 'abc' }, { path: '/shop' }],
      [{ page: '0' }, { path: '/shop' }],
      [{ page: '-3' }, { path: '/shop' }],
      [{ sort: 'featured' }, { path: '/shop' }], // the default order, so the same page
    ];
    for (const [params, want] of cases) assert.deepEqual(shopIndexing(params), want, JSON.stringify(params));
  });

  test('a collection view is indexed under the collection page, whatever its page number or order', () => {
    const base = { collection: 'seafood', collectionFound: true };
    for (const extra of [{}, { page: '3' }, { sort: 'price-asc' }, { tag: 'onSale' }]) {
      assert.deepEqual(shopIndexing({ ...base, ...extra }), { path: '/collection/seafood' }, JSON.stringify(extra));
    }
  });

  test('a collection that does not exist is kept out of the index', () => {
    assert.deepEqual(shopIndexing({ collection: 'nope', collectionFound: false }), { noindex: true });
  });

  test('search results, tag lists and re-sorted listings are kept out of the index', () => {
    const cases = [
      { search: 'rice' },
      { search: 'rice', collection: 'seafood', collectionFound: true }, // search wins, as it does on the page
      { tag: 'onSale' },
      { tag: 'bestseller', page: '2' },
      { sort: 'price-asc' },
      { sort: 'name-asc', page: '2' },
    ];
    for (const params of cases) assert.deepEqual(shopIndexing(params), { noindex: true }, JSON.stringify(params));
  });
});

describe('organizationLd', () => {
  const settings = {
    companyName: 'Elaff Trade Co.',
    country: 'China',
    yearEstablished: '2012',
    exportMarkets: ['Western Europe', 'North America'],
    mainProducts: ['Snacks', 'Soft Drinks'],
    phone: '+00 000 0000',
    email: 'sales@example.com',
    address: 'Building 5, Market Road\nYiwu City\r\nZhejiang',
  };

  test('reports the facts stored in Company Settings', () => {
    const org = organizationLd(settings);
    assert.equal(org['@type'], 'Organization');
    assert.equal(org.name, 'Elaff Trade Co.');
    assert.equal(org.url, 'https://www.example.com/');
    assert.equal(org.logo, 'https://www.example.com/logo.png');
    assert.equal(org.foundingDate, '2012');
    assert.deepEqual(org.areaServed, ['Western Europe', 'North America']);
    assert.deepEqual(org.knowsAbout, ['Snacks', 'Soft Drinks']);
    assert.deepEqual(org.contactPoint, {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+00 000 0000',
      email: 'sales@example.com',
    });
  });

  test('flattens a multi-line admin address into one street line and keeps the country', () => {
    assert.deepEqual(organizationLd(settings).address, {
      '@type': 'PostalAddress',
      streetAddress: 'Building 5, Market Road, Yiwu City, Zhejiang',
      addressCountry: 'China',
    });
  });

  test('still reports where the company is when only the country is known', () => {
    assert.deepEqual(organizationLd({ country: 'China' }).address, {
      '@type': 'PostalAddress',
      addressCountry: 'China',
    });
  });

  test('emits no blank fields when Company Settings are empty or whitespace', () => {
    const org = organizationLd({
      companyName: '',
      country: '  ',
      yearEstablished: '',
      exportMarkets: [],
      mainProducts: ['  '],
      phone: '',
      email: '   ',
      address: ' \n ',
    });
    assertNoEmptyValues(org);
    for (const key of ['email', 'telephone', 'address', 'contactPoint', 'foundingDate', 'areaServed']) {
      assert.ok(!(key in org), `${key} should be left out`);
    }
    assert.equal(org.name, 'Elaff Trade Co.', 'falls back to the default site name');
  });

  test('foundingDate is only reported for a four-digit year', () => {
    const cases = [
      ['2012', '2012'],
      ['Since 2012', undefined],
      ['12', undefined],
      ['', undefined],
    ];
    for (const [yearEstablished, want] of cases) {
      assert.equal(organizationLd({ yearEstablished }).foundingDate, want, `yearEstablished=${yearEstablished}`);
    }
  });
});

describe('websiteLd', () => {
  test("site search points at the shop's search parameter and names the same placeholder twice", () => {
    const { potentialAction } = websiteLd({});
    assert.equal(potentialAction.target.urlTemplate, 'https://www.example.com/shop?search={search_term_string}');
    assert.equal(potentialAction['query-input'], 'required name=search_term_string');
  });
});

describe('graph integrity', () => {
  test('references to the organization and website use the ids those nodes declare', () => {
    const org = organizationLd({});
    const site = websiteLd({});
    const page = webPageLd({ type: 'AboutPage', path: '/about', name: 'About Us' });
    const service = serviceLd({ name: 'International Logistics' });
    const product = productLd({ title: 'Rice', slug: 'rice', price: 10 });

    assert.equal(org['@id'], 'https://www.example.com/#organization');
    assert.equal(site['@id'], 'https://www.example.com/#website');
    assert.equal(site.publisher['@id'], org['@id']);
    assert.equal(page.isPartOf['@id'], site['@id']);
    assert.equal(service.provider['@id'], org['@id']);
    assert.equal(product.offers.seller['@id'], org['@id']);
  });

  test('webPageLd gives each page its own typed, addressable node', () => {
    const page = webPageLd({ type: 'ContactPage', path: '/contact', name: 'Contact Us' });
    assert.equal(page['@type'], 'ContactPage');
    assert.equal(page['@id'], 'https://www.example.com/contact#webpage');
    assert.equal(page.url, 'https://www.example.com/contact');
  });

  test('jsonLdGraph wraps nodes in a schema.org graph and skips missing ones', () => {
    const org = organizationLd({});
    assert.deepEqual(jsonLdGraph([org, undefined, faqLd([], '/')]), {
      '@context': 'https://schema.org',
      '@graph': [org],
    });
  });
});

describe('jsonLdHtml', () => {
  test('accepts one node or a list and yields the same schema.org graph', () => {
    const org = organizationLd({});
    const want = { '@context': 'https://schema.org', '@graph': [org] };
    assert.deepEqual(JSON.parse(jsonLdHtml(org)), want);
    assert.deepEqual(JSON.parse(jsonLdHtml([org])), want);
  });

  test('publishes nothing in a production build without a site URL, since every id would be localhost', async (t) => {
    t.mock.method(console, 'warn', () => {});
    const unset = await loadSeo(undefined, 'production');
    assert.equal(unset.jsonLdHtml(unset.websiteLd({})), null);
    const set = await loadSeo('https://www.example.com', 'production');
    assert.notEqual(set.jsonLdHtml(set.websiteLd({})), null);
  });

  test('returns null when there is nothing to describe', () => {
    assert.equal(jsonLdHtml(undefined), null);
    assert.equal(jsonLdHtml([undefined, faqLd([], '/')]), null);
  });

  test('the string it returns is safe to place inside a script tag', () => {
    const html = jsonLdHtml(organizationLd({ companyName: 'Evil </script><script>alert(1)</script>' }));
    assert.ok(!html.includes('<'));
  });
});

describe('breadcrumbLd', () => {
  test('numbers crumbs from 1 and links each to an absolute URL', () => {
    const node = breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      { name: 'Rice', path: '/product/rice' },
    ]);
    assert.equal(node['@type'], 'BreadcrumbList');
    assert.deepEqual(
      node.itemListElement.map((c) => [c.position, c.name, c.item]),
      [
        [1, 'Home', 'https://www.example.com/'],
        [2, 'Shop', 'https://www.example.com/shop'],
        [3, 'Rice', 'https://www.example.com/product/rice'],
      ]
    );
  });

  test('returns nothing for an empty trail', () => {
    assert.equal(breadcrumbLd([]), undefined);
  });
});

describe('productLd', () => {
  const base = { title: 'Rice', slug: 'rice' };

  test('has no offer when the product has no usable price', () => {
    for (const price of [null, undefined, 0]) {
      assert.ok(!('offers' in productLd({ ...base, price })), `price=${price}`);
    }
  });

  test('a flat price becomes a USD offer sold by the organization', () => {
    assert.deepEqual(productLd({ ...base, price: 12.5, priceUnit: '' }).offers, {
      '@type': 'Offer',
      url: 'https://www.example.com/product/rice',
      price: 12.5,
      priceCurrency: 'USD',
      seller: { '@id': 'https://www.example.com/#organization' },
    });
  });

  test('a per-unit price is expressed as a unit price, never as a bare price', () => {
    const { offers } = productLd({ ...base, price: 205, priceUnit: ' / ton' });
    assert.deepEqual(offers.priceSpecification, {
      '@type': 'UnitPriceSpecification',
      price: 205,
      priceCurrency: 'USD',
      unitText: 'ton',
    });
    assert.ok(!('price' in offers), 'a bare price would present "$205" as the price of a single item');
  });

  test('image URLs are made absolute, leaving hosted ones as they are', () => {
    const hosted = 'https://res.cloudinary.com/demo/image/upload/v1/rice.jpg';
    assert.deepEqual(productLd({ ...base, images: ['/placeholder.jpg', hosted] }).image, [
      'https://www.example.com/placeholder.jpg',
      hosted,
    ]);
  });

  test('blank image entries are dropped instead of turning into the home page URL', () => {
    assert.ok(!('image' in productLd({ ...base, images: ['', '  '] })));
  });

  test('description prefers the short description, else the plain text of the full one', () => {
    const fullDescription = '<p>High-protein <b>feed</b></p><p>Bulk bags</p>';
    assert.equal(productLd({ ...base, shortDescription: 'Corn meal', fullDescription }).description, 'Corn meal');
    assert.equal(productLd({ ...base, shortDescription: '', fullDescription }).description, 'High-protein feed Bulk bags');
  });

  test('category falls back to the first collection title', () => {
    assert.equal(productLd({ ...base, category: '', collections: [{ title: 'Beverages' }] }).category, 'Beverages');
  });

  test('buyer-facing facts (specs, shipping rows, MOQ, lead time) become additional properties', () => {
    const { additionalProperty } = productLd({
      ...base,
      specifications: [{ label: 'Protein', value: '60% Min' }],
      shippingInfo: [{ label: 'FOB Port', value: 'Shanghai' }],
      moq: '10000 Cartons',
      leadTime: '7-14 days',
    });
    assert.ok(additionalProperty.every((p) => p['@type'] === 'PropertyValue'));
    assert.deepEqual(Object.fromEntries(additionalProperty.map((p) => [p.name, p.value])), {
      Protein: '60% Min',
      'FOB Port': 'Shanghai',
      'Minimum order quantity': '10000 Cartons',
      'Lead time': '7-14 days',
    });
  });

  test('a sparse product emits no blank fields', () => {
    assertNoEmptyValues(
      productLd({
        ...base,
        sku: '',
        category: '',
        collections: [],
        images: [],
        specifications: [],
        shippingInfo: [],
        moq: '',
        leadTime: '',
        shortDescription: '',
        fullDescription: '',
        price: null,
      })
    );
  });
});

describe('collectionLd', () => {
  test('lists products in order with absolute URLs', () => {
    const node = collectionLd(
      { title: 'Beverages', slug: 'beverages', description: 'Soft drinks and water.' },
      makeProducts(3)
    );
    assert.equal(node['@type'], 'CollectionPage');
    assert.equal(node.url, 'https://www.example.com/collection/beverages');
    assert.deepEqual(
      node.mainEntity.itemListElement.map((i) => [i.position, i.url, i.name]),
      [
        [1, 'https://www.example.com/product/item-1', 'Item 1'],
        [2, 'https://www.example.com/product/item-2', 'Item 2'],
        [3, 'https://www.example.com/product/item-3', 'Item 3'],
      ]
    );
  });

  test('a very long product list is capped, with numberOfItems matching what is listed', () => {
    const list = collectionLd({ title: 'Snacks', slug: 'snacks' }, makeProducts(250)).mainEntity;
    const listed = list.itemListElement.length;
    assert.ok(listed > 0 && listed < 250, `expected a capped list, got ${listed} items`);
    assert.equal(list.numberOfItems, listed);
    assert.equal(list.itemListElement.at(-1).position, listed);
  });

  test('an empty collection has no item list', () => {
    assert.equal(collectionLd({ title: 'Empty', slug: 'empty' }, []).mainEntity, undefined);
  });
});

describe('faqLd', () => {
  test('maps each question and answer into FAQPage question/answer nodes', () => {
    const node = faqLd([{ question: 'What is your MOQ?', answer: 'One pallet.' }], '/about');
    assert.equal(node['@type'], 'FAQPage');
    assert.equal(node['@id'], 'https://www.example.com/about#faq');
    assert.deepEqual(node.mainEntity, [
      {
        '@type': 'Question',
        name: 'What is your MOQ?',
        acceptedAnswer: { '@type': 'Answer', text: 'One pallet.' },
      },
    ]);
  });

  test('returns nothing when there are no questions', () => {
    assert.equal(faqLd([], '/about'), undefined);
  });
});

describe('articleLd', () => {
  const article = {
    slug: 'frozen-rice-guide',
    title: "Frozen Rice: A Buyer's Guide",
    description: 'How bulk buyers choose frozen rice.',
    keyword: 'frozen rice wholesale',
    keywords: ['bulk rice', 'rice supplier'],
    date: '2026-10-14',
    updated: '2026-10-20',
    wordCount: 1042,
  };
  const node = articleLd(article, { companyName: 'Elaff Trade Co.' });

  test('describes the article at its own address', () => {
    assert.equal(node['@type'], 'BlogPosting');
    assert.equal(node['@id'], 'https://www.example.com/blog/frozen-rice-guide#article');
    assert.equal(node.url, 'https://www.example.com/blog/frozen-rice-guide');
    assert.deepEqual(node.mainEntityOfPage, { '@type': 'WebPage', '@id': 'https://www.example.com/blog/frozen-rice-guide' });
    assert.equal(node.headline, "Frozen Rice: A Buyer's Guide");
    assert.equal(node.description, 'How bulk buyers choose frozen rice.');
    assert.equal(node.datePublished, '2026-10-14');
    assert.equal(node.dateModified, '2026-10-20');
    assert.equal(node.wordCount, 1042);
    assert.equal(node.inLanguage, 'en');
  });

  test('lists the main keyword first, then the others, as one comma-separated string', () => {
    assert.equal(node.keywords, 'frozen rice wholesale, bulk rice, rice supplier');
    assert.equal(articleLd({ ...article, keywords: [] }).keywords, 'frozen rice wholesale');
    assert.equal(articleLd({ ...article, keywords: ['', '  ', ' bulk rice '] }).keywords, 'frozen rice wholesale, bulk rice');
  });

  test('has an absolute image address', () => {
    assert.deepEqual(node.image, ['https://www.example.com/og-default.png']);
  });

  test('is written and published by the organization, with a name and address on the node itself', () => {
    const org = organizationLd({});
    for (const role of [node.author, node.publisher]) {
      assert.equal(role['@type'], 'Organization');
      assert.equal(role['@id'], org['@id']);
      assert.equal(role.name, 'Elaff Trade Co.');
      assert.equal(role.url, 'https://www.example.com/');
    }
    assert.deepEqual(node.publisher.logo, { '@type': 'ImageObject', url: 'https://www.example.com/logo.png' });
    assert.ok(!('logo' in node.author));
  });

  test('uses the company name from Company Settings and falls back to the site name', () => {
    assert.equal(articleLd(article, { companyName: 'Elaff Foods' }).author.name, 'Elaff Foods');
    assert.equal(articleLd(article, { companyName: '  ' }).author.name, 'Elaff Trade Co.');
    assert.equal(articleLd(article).author.name, 'Elaff Trade Co.');
  });

  test('is part of the website and carries no empty values', () => {
    assert.equal(node.isPartOf['@id'], websiteLd({})['@id']);
    assertNoEmptyValues(node);
  });
});

describe('blogLd', () => {
  const articles = [
    { slug: 'newer', title: 'Newer', description: 'About newer.', date: '2026-10-20', updated: '2026-10-21' },
    { slug: 'older', title: 'Older', description: 'About older.', date: '2026-10-14', updated: '2026-10-14' },
  ];
  const node = blogLd(articles);

  test('is the blog at /blog, published by the organization, inside the website', () => {
    assert.equal(node['@type'], 'Blog');
    assert.equal(node['@id'], 'https://www.example.com/blog#blog');
    assert.equal(node.url, 'https://www.example.com/blog');
    assert.equal(node.name, seo.BLOG_TITLE);
    assert.equal(node.description, seo.BLOG_DESCRIPTION);
    assert.equal(node.publisher['@id'], organizationLd({})['@id']);
    assert.equal(node.isPartOf['@id'], websiteLd({})['@id']);
  });

  test('lists its posts in the given order with absolute addresses and dates', () => {
    assert.deepEqual(node.blogPost, [
      {
        '@type': 'BlogPosting',
        headline: 'Newer',
        url: 'https://www.example.com/blog/newer',
        datePublished: '2026-10-20',
        dateModified: '2026-10-21',
      },
      {
        '@type': 'BlogPosting',
        headline: 'Older',
        url: 'https://www.example.com/blog/older',
        datePublished: '2026-10-14',
        dateModified: '2026-10-14',
      },
    ]);
  });

  test('a blog with no posts has no post list, and nothing blank anywhere', () => {
    assert.ok(!('blogPost' in blogLd([])));
    assertNoEmptyValues(node);
    assertNoEmptyValues(blogLd([]));
  });

  test('the blog title and description fit what search results display', () => {
    assert.ok(seo.BLOG_TITLE.length <= 60, `title is ${seo.BLOG_TITLE.length} characters`);
    assert.ok(seo.BLOG_DESCRIPTION.length <= 155, `description is ${seo.BLOG_DESCRIPTION.length} characters`);
  });
});
