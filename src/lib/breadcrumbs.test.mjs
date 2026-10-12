import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { productBreadcrumbs, collectionBreadcrumbs, blogBreadcrumbs, articleBreadcrumbs } from './breadcrumbs.js';

const HOME = { name: 'Home', path: '/' };
const SHOP = { name: 'Shop', path: '/shop' };

describe('productBreadcrumbs', () => {
  const product = { title: 'Frozen Mangoes', slug: 'frozen-mangoes' };

  test("runs Home, Shop, the product's collection, then the product itself", () => {
    const trail = productBreadcrumbs({ ...product, collections: [{ title: 'Fresh Fruits', slug: 'fresh-fruits' }] });
    assert.deepEqual(trail, [
      HOME,
      SHOP,
      { name: 'Fresh Fruits', path: '/collection/fresh-fruits' },
      { name: 'Frozen Mangoes', path: '/product/frozen-mangoes' },
    ]);
  });

  test('has no collection level when the product belongs to none', () => {
    for (const collections of [undefined, [], [null], [{ title: 'No slug' }]]) {
      assert.deepEqual(
        productBreadcrumbs({ ...product, collections }),
        [HOME, SHOP, { name: 'Frozen Mangoes', path: '/product/frozen-mangoes' }],
        JSON.stringify(collections)
      );
    }
  });

  test('uses the first collection that has both a title and a slug', () => {
    const trail = productBreadcrumbs({
      ...product,
      collections: [{ slug: 'untitled' }, { title: 'Seafood', slug: 'seafood' }, { title: 'Frozen Foods', slug: 'frozen-foods' }],
    });
    assert.equal(trail[2].name, 'Seafood');
    assert.equal(trail[2].path, '/collection/seafood');
  });
});

describe('collectionBreadcrumbs', () => {
  test('runs Home, Shop, then the collection', () => {
    assert.deepEqual(collectionBreadcrumbs({ title: 'Seafood', slug: 'seafood' }), [
      HOME,
      SHOP,
      { name: 'Seafood', path: '/collection/seafood' },
    ]);
  });
});

describe('blog breadcrumbs', () => {
  const BLOG = { name: 'Blog', path: '/blog' };

  test('the blog list runs Home, then Blog', () => {
    assert.deepEqual(blogBreadcrumbs(), [HOME, BLOG]);
  });

  test('an article runs Home, Blog, then the article', () => {
    assert.deepEqual(articleBreadcrumbs({ title: 'EXW vs FOB vs CNF', slug: 'exw-vs-fob-vs-cnf' }), [
      HOME,
      BLOG,
      { name: 'EXW vs FOB vs CNF', path: '/blog/exw-vs-fob-vs-cnf' },
    ]);
  });
});
