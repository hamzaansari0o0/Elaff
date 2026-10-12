import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { pickFooterCollections } from './footerLinks.js';

const collections = [
  { title: 'Soft Drinks', slug: 'soft-drinks' }, // listed before Seafood on purpose: tied counts must not keep this order
  { title: 'Seafood', slug: 'seafood' },
  { title: 'Agriculture', slug: 'agriculture' },
  { title: 'Cooking Oil', slug: 'cooking-oil' },
  { title: 'Empty Shelf', slug: 'empty-shelf' },
];
const cards = [
  { slug: 'seafood', productCount: 40 },
  { slug: 'soft-drinks', productCount: 40 },
  { slug: 'agriculture', productCount: 7 },
  { slug: 'cooking-oil', productCount: 12 },
  { slug: 'empty-shelf', productCount: 0 },
];
const slugs = (list) => list.map((item) => item.slug);

describe('pickFooterCollections', () => {
  test('lists the most stocked collections first, breaking ties alphabetically', () => {
    assert.deepEqual(slugs(pickFooterCollections(collections, cards, 4)), [
      'seafood', // 40, ties with soft drinks but comes first alphabetically
      'soft-drinks',
      'cooking-oil', // 12
      'agriculture', // 7
    ]);
  });

  test('stops at the limit', () => {
    assert.deepEqual(slugs(pickFooterCollections(collections, cards, 2)), ['seafood', 'soft-drinks']);
  });

  test('leaves out collections with no products, so the footer never links to an empty page', () => {
    assert.ok(!slugs(pickFooterCollections(collections, cards, 10)).includes('empty-shelf'));
  });

  test('treats a collection with no stock information as empty', () => {
    const withMystery = [...collections, { title: 'Mystery', slug: 'mystery' }];
    assert.ok(!slugs(pickFooterCollections(withMystery, cards, 10)).includes('mystery'));
  });

  test("hands back plain title/slug pairs with the admin's capitalisation", () => {
    assert.deepEqual(pickFooterCollections(collections, cards, 1), [{ title: 'Seafood', slug: 'seafood' }]);
  });

  test('skips collections that have no title or no slug', () => {
    const broken = [{ title: '  ', slug: 'blank-title' }, { title: 'No slug' }, { title: 'Seafood', slug: 'seafood' }];
    // the stray card with an empty slug would otherwise match the slug-less collection
    const counts = [{ slug: 'blank-title', productCount: 99 }, { slug: '', productCount: 7 }, { slug: 'seafood', productCount: 1 }];
    assert.deepEqual(slugs(pickFooterCollections(broken, counts, 5)), ['seafood']);
  });

  test('copes with missing input', () => {
    assert.deepEqual(pickFooterCollections(undefined, undefined), []);
    assert.deepEqual(pickFooterCollections(collections, undefined), []);
  });

  test('keeps the footer compact by default, however many collections exist', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ title: `Collection ${i}`, slug: `c-${i}` }));
    const stocked = many.map((c) => ({ slug: c.slug, productCount: 5 }));
    const picked = pickFooterCollections(many, stocked);
    assert.ok(picked.length > 0 && picked.length < 30, `got ${picked.length} links`);
  });
});
