import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { prepareShopCategories, filterShopCategories } from './shopCategories.js';

// Cards as getCategoryCards() returns them: the title is shouted, `name` keeps the admin's capitalisation.
const cards = [
  { title: 'SOFT DRINKS', name: 'Soft drinks', slug: 'soft-drinks', productCount: 49 },
  { title: 'SEAFOOD', name: 'Seafood', slug: 'seafood', productCount: 57 },
  { title: 'AGRICULTURE', name: 'Agriculture', slug: 'agriculture', productCount: 9 },
  { title: 'EMPTY SHELF', name: 'Empty Shelf', slug: 'empty-shelf', productCount: 0 },
];
const slugs = (list) => list.map((c) => c.slug);

describe('prepareShopCategories', () => {
  test("shows the admin's capitalisation, not the shouted title", () => {
    const seafood = prepareShopCategories(cards).find((c) => c.slug === 'seafood');
    assert.equal(seafood.title, 'Seafood');
  });

  test('falls back to the title when a card has no name', () => {
    const [only] = prepareShopCategories([{ title: 'SPICES', slug: 'spices', productCount: 2 }]);
    assert.equal(only.title, 'SPICES');
  });

  test('lists collections A to Z, however the admin capitalised them', () => {
    const mixed = [
      { name: 'zebra feed', slug: 'z', productCount: 1 },
      { name: 'Agriculture', slug: 'a', productCount: 1 },
      { name: 'beverages', slug: 'b', productCount: 1 },
    ];
    assert.deepEqual(slugs(prepareShopCategories(mixed)), ['a', 'b', 'z']);
  });

  test('leaves out collections with no products, so the list has no dead ends', () => {
    assert.ok(!slugs(prepareShopCategories(cards)).includes('empty-shelf'));
  });

  test('keeps an empty collection when it is the one being viewed, so it can still show as selected', () => {
    assert.ok(slugs(prepareShopCategories(cards, 'empty-shelf')).includes('empty-shelf'));
  });

  test('carries the product count as a number', () => {
    const soft = prepareShopCategories(cards).find((c) => c.slug === 'soft-drinks');
    assert.equal(soft.count, 49);
  });

  test('gives every collection the same icon and colour its home page tile has', () => {
    const seafood = prepareShopCategories(cards).find((c) => c.slug === 'seafood');
    assert.equal(seafood.icon, 'Fish');
    assert.match(seafood.color, /^#[0-9a-f]{6}$/i);
  });

  test('copes with missing input', () => {
    assert.deepEqual(prepareShopCategories(undefined), []);
    assert.deepEqual(prepareShopCategories([]), []);
  });

  test('skips entries that have no slug, since they cannot be linked to', () => {
    assert.deepEqual(slugs(prepareShopCategories([{ name: 'Broken', productCount: 3 }, ...cards])), ['agriculture', 'seafood', 'soft-drinks']);
  });
});

describe('filterShopCategories', () => {
  const list = prepareShopCategories([
    { name: 'Soft drinks', slug: 'soft-drinks', productCount: 49 },
    { name: 'Energy drinks', slug: 'energy-drinks', productCount: 17 },
    { name: 'Personal Care & Household Cleaning', slug: 'personal-care', productCount: 67 },
    { name: 'Seafood', slug: 'seafood', productCount: 57 },
  ]);

  test('returns everything for an empty or blank search', () => {
    assert.equal(filterShopCategories(list, '').length, 4);
    assert.equal(filterShopCategories(list, '   ').length, 4);
    assert.equal(filterShopCategories(list, undefined).length, 4);
  });

  test('finds a word anywhere in the name, ignoring capitalisation', () => {
    assert.deepEqual(slugs(filterShopCategories(list, 'DRINK')), ['energy-drinks', 'soft-drinks']);
    assert.deepEqual(slugs(filterShopCategories(list, 'care')), ['personal-care']);
  });

  test('ignores spaces around what was typed', () => {
    assert.deepEqual(slugs(filterShopCategories(list, '  sea ')), ['seafood']);
  });

  test('returns nothing when no collection matches', () => {
    assert.deepEqual(filterShopCategories(list, 'zzz'), []);
  });

  test('takes what is typed literally, so punctuation does not break it', () => {
    assert.deepEqual(slugs(filterShopCategories(list, '&')), ['personal-care']);
    assert.doesNotThrow(() => filterShopCategories(list, '(['));
  });
});
