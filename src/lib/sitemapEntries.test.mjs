import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import nextRouteData from 'next/dist/build/webpack/loaders/metadata/resolve-route-data.js';

// seo.js reads the site URL when first imported, so set it before importing.
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.example.com';
const { buildSitemapEntries } = await import('./sitemapEntries.js');

const products = [
  {
    slug: 'rice',
    updatedAt: '2026-09-01T10:00:00.000Z',
    images: ['https://res.cloudinary.com/x/rice1.jpg', '', '/local.jpg', '   '],
    collections: [{ slug: 'grocery' }],
  },
  {
    slug: 'tea',
    updatedAt: '2026-09-20T10:00:00.000Z',
    images: [],
    collections: [{ slug: 'beverages' }, { slug: 'grocery' }],
  },
  { slug: 'orphan', updatedAt: '2026-08-01T10:00:00.000Z', collections: [] },
];
const collections = [
  { slug: 'grocery', updatedAt: '2026-07-01T00:00:00.000Z', image: 'https://res.cloudinary.com/x/grocery.jpg' },
  { slug: 'beverages', updatedAt: '2026-10-01T00:00:00.000Z', image: '' },
  { slug: 'empty', updatedAt: '2026-06-01T00:00:00.000Z' },
];
const settings = { updatedAt: '2026-09-10T00:00:00.000Z' };

const entries = buildSitemapEntries({ products, collections, settings });
const at = (path) => entries.find((entry) => entry.url === `https://www.example.com${path}`);

describe('sitemap entries', () => {
  test('lists the fixed pages, then collections, then products, all as absolute URLs', () => {
    assert.deepEqual(
      entries.map((entry) => entry.url.replace('https://www.example.com', '')),
      [
        '/', '/shop', '/collections', '/about', '/partners', '/contact',
        '/collection/grocery', '/collection/beverages', '/collection/empty',
        '/product/rice', '/product/tea', '/product/orphan',
      ]
    );
  });

  test('home, shop and collections are dated by the newest change anywhere in the catalog', () => {
    for (const path of ['/', '/shop', '/collections']) {
      assert.equal(at(path).lastModified, '2026-10-01T00:00:00.000Z', path);
    }
  });

  test('about and partners carry no date rather than an invented one', () => {
    for (const path of ['/about', '/partners']) {
      assert.ok(!('lastModified' in at(path)), `${path} should have no lastModified`);
    }
  });

  test('contact is dated by Company Settings, which is what that page shows', () => {
    assert.equal(at('/contact').lastModified, '2026-09-10T00:00:00.000Z');
  });

  test("a collection counts its products' changes, not only its own", () => {
    assert.equal(at('/collection/grocery').lastModified, '2026-09-20T10:00:00.000Z'); // tea is newer than the collection
    assert.equal(at('/collection/beverages').lastModified, '2026-10-01T00:00:00.000Z'); // the collection itself is newer
    assert.equal(at('/collection/empty').lastModified, '2026-06-01T00:00:00.000Z'); // no products at all
  });

  test('a product is dated by its own last update', () => {
    assert.equal(at('/product/rice').lastModified, '2026-09-01T10:00:00.000Z');
    assert.equal(at('/product/orphan').lastModified, '2026-08-01T10:00:00.000Z');
  });

  test('images become absolute URLs, blanks are dropped, and none means no images field', () => {
    assert.deepEqual(at('/product/rice').images, [
      'https://res.cloudinary.com/x/rice1.jpg',
      'https://www.example.com/local.jpg',
    ]);
    assert.deepEqual(at('/collection/grocery').images, ['https://res.cloudinary.com/x/grocery.jpg']);
    for (const path of ['/product/tea', '/product/orphan', '/collection/beverages', '/collection/empty', '/about']) {
      assert.ok(!('images' in at(path)), `${path} should have no images`);
    }
  });

  test('an empty catalog still lists the fixed pages, none of them dated', () => {
    const empty = buildSitemapEntries({ products: [], collections: [] });
    assert.equal(empty.length, 6);
    assert.ok(empty.every((entry) => !('lastModified' in entry)));
  });

  test('unreadable dates are ignored instead of poisoning the dates around them', () => {
    const messy = buildSitemapEntries({
      products: [
        { slug: 'broken', updatedAt: 'not a date' },
        { slug: 'undated' },
        { slug: 'fine', updatedAt: '2026-05-05T00:00:00.000Z' },
      ],
      collections: [],
    });
    const find = (path) => messy.find((entry) => entry.url.endsWith(path));
    assert.equal(find('/').lastModified, '2026-05-05T00:00:00.000Z');
    assert.ok(!('lastModified' in find('/product/broken')));
    assert.ok(!('lastModified' in find('/product/undated')));
  });
});

describe('sitemap with blog articles', () => {
  const articles = [
    { slug: 'newer', updated: '2026-10-21' },
    { slug: 'older', updated: '2026-10-14' },
  ];
  const withBlog = buildSitemapEntries({ products, collections, settings, articles });
  const blogAt = (path) => withBlog.find((entry) => entry.url === `https://www.example.com${path}`);

  test('lists /blog among the fixed pages and each article after the products', () => {
    assert.deepEqual(
      withBlog.map((entry) => entry.url.replace('https://www.example.com', '')),
      [
        '/', '/shop', '/collections', '/blog', '/about', '/partners', '/contact',
        '/collection/grocery', '/collection/beverages', '/collection/empty',
        '/product/rice', '/product/tea', '/product/orphan',
        '/blog/newer', '/blog/older',
      ]
    );
  });

  test('an article is dated by its own last update', () => {
    assert.equal(blogAt('/blog/newer').lastModified, '2026-10-21T00:00:00.000Z');
    assert.equal(blogAt('/blog/older').lastModified, '2026-10-14T00:00:00.000Z');
  });

  test('the blog list is dated by its newest article', () => {
    assert.equal(blogAt('/blog').lastModified, '2026-10-21T00:00:00.000Z');
  });

  test('without articles there is no /blog page to list', () => {
    for (const none of [undefined, []]) {
      const entries = buildSitemapEntries({ products, collections, settings, articles: none });
      assert.ok(!entries.some((entry) => entry.url.includes('/blog')));
    }
  });

  test('articles carry no images field', () => {
    assert.ok(!('images' in blogAt('/blog/newer')));
  });
});

describe('sitemap XML as Next writes it', () => {
  // Next puts URLs into the XML exactly as given, so an unescaped "&" in an
  // image link would make the whole file unreadable to search engines.
  const unescape = (text) => text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const risky = [
    'https://images.unsplash.com/photo-1?q=80&w=300&auto=format',
    'https://example.com/a<b>c.jpg',
  ];

  test('is well-formed and decodes back to the original image URLs when they contain "&", "<" or ">"', () => {
    const xml = nextRouteData.resolveRouteData(
      buildSitemapEntries({ products: [{ slug: 'mango', updatedAt: '2026-01-01T00:00:00.000Z', images: risky }], collections: [] }),
      'sitemap'
    );
    assert.ok(!/&(?!amp;|lt;|gt;)/.test(xml), 'found a bare "&", which is invalid XML');
    const found = [...xml.matchAll(/<image:loc>([^<]*)<\/image:loc>/g)].map((match) => unescape(match[1]));
    assert.deepEqual(found, risky);
  });
});

describe('sitemap without a configured site URL', () => {
  const dir = fileURLToPath(new URL('.', import.meta.url));
  const run = (siteUrl) => {
    const env = { ...process.env, NODE_ENV: 'production' };
    delete env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) env.NEXT_PUBLIC_SITE_URL = siteUrl;
    const code = `
      const { buildSitemapEntries } = await import('./sitemapEntries.js');
      console.log(JSON.stringify(buildSitemapEntries({ products: [{ slug: 'rice' }], collections: [] }).length));
    `;
    const result = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--input-type=module', '-e', code], {
      cwd: dir,
      env,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout.trim());
  };

  test('a production build lists nothing rather than localhost URLs, and lists everything once it is set', () => {
    assert.equal(run(undefined), 0);
    assert.equal(run('https://www.example.com'), 7); // 6 fixed pages + 1 product
  });
});
