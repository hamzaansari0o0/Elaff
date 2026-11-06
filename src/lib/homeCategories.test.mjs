import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { categoryStyle, pickHomeCategories } from './homeCategories.js';

describe('categoryStyle: which icon a collection tile gets', () => {
  // [collection title as the admin typed it, icon]. The titles are real collections;
  // the interesting rows are the ones where a broader word could have claimed the tile.
  const cases = [
    ['Frozen Foods', 'Snowflake'], // not the generic food icon
    ['Seafood', 'Fish'], // "food" is inside the word, but it is fish
    ['Meat & Poultry', 'Drumstick'],
    ['Baby Food & General Supplies', 'Baby'], // baby beats food
    ['Maternity & Baby Care Products', 'Baby'],
    ['Energy drinks', 'Zap'], // not a soft drink
    ['Coffee drinks', 'Coffee'], // not a soft drink either
    ['Soft drinks', 'CupSoda'],
    ['Food & Beverages', 'UtensilsCrossed'], // the catch-all for food, after every specific one
    ['Confectionery', 'Candy'],
    ['Cooking oil', 'Droplets'],
    ['Plant & Animal Oil', 'Droplets'],
    ['Condiments & Edible Oil', 'Droplets'],
    ['Fresh Fruits', 'Apple'],
    ['Fresh Vegetables', 'Carrot'],
    ['Agriculture', 'Sprout'],
    ['Animal feed', 'Wheat'],
    ['Personal Care & Household Cleaning', 'SprayCan'],
  ];

  for (const [title, icon] of cases) {
    test(`"${title}" gets ${icon}`, () => {
      assert.equal(categoryStyle(title).icon, icon);
    });
  }

  test('ignores capitalisation, since admins type titles any way they like', () => {
    assert.equal(categoryStyle('FROZEN FOODS').icon, 'Snowflake');
    assert.equal(categoryStyle('seafood').icon, 'Fish');
  });

  test('gives a collection nobody planned for a plain shopping basket instead of nothing', () => {
    assert.equal(categoryStyle('Spices & Herbs').icon, 'ShoppingBasket');
    assert.equal(categoryStyle('').icon, 'ShoppingBasket');
    assert.equal(categoryStyle(undefined).icon, 'ShoppingBasket');
  });
});

describe('categoryStyle: the tile colour', () => {
  const titles = ['Frozen Foods', 'Seafood', 'Spices & Herbs', 'Brand New Collection', '', undefined];

  test('is always a six-digit hex colour, including for collections nobody planned for', () => {
    for (const title of titles) {
      assert.match(categoryStyle(title).color, /^#[0-9a-f]{6}$/i, `colour for ${JSON.stringify(title)}`);
    }
  });

  test('never changes for the same title, so a tile keeps its colour between visits and deploys', () => {
    for (const title of titles) {
      assert.equal(categoryStyle(title).color, categoryStyle(title).color);
    }
  });

  test('is the same however the title is capitalised', () => {
    assert.equal(categoryStyle('Spices & Herbs').color, categoryStyle('SPICES & HERBS').color);
  });

  test('is not one colour for everything, so a row of unplanned collections still looks varied', () => {
    const colours = new Set(
      ['Spices', 'Herbs', 'Pasta', 'Rice', 'Flour', 'Sugar', 'Salt', 'Honey', 'Tea Bags', 'Nuts'].map((t) => categoryStyle(t).color)
    );
    assert.ok(colours.size >= 3, `only ${colours.size} distinct colours`);
  });
});

describe('pickHomeCategories', () => {
  const collections = [
    { title: 'Soft drinks', slug: 'soft-drinks' }, // listed first on purpose: tied counts must not keep this order
    { title: 'Seafood', slug: 'seafood' },
    { title: 'Confectionery', slug: 'confectionery' },
    { title: 'Empty Shelf', slug: 'empty-shelf' },
  ];
  const cards = [
    { slug: 'seafood', productCount: 57 },
    { slug: 'soft-drinks', productCount: 57 },
    { slug: 'confectionery', productCount: 33 },
    { slug: 'empty-shelf', productCount: 0 },
  ];

  test('lists the most stocked collections first, breaking ties alphabetically', () => {
    assert.deepEqual(
      pickHomeCategories(collections, cards).map((c) => c.slug),
      ['seafood', 'soft-drinks', 'confectionery']
    );
  });

  test('leaves out collections with no products, so a tile never opens an empty page', () => {
    assert.ok(!pickHomeCategories(collections, cards).some((c) => c.slug === 'empty-shelf'));
  });

  test("keeps the admin's capitalisation for the tile label and gives every tile an icon and colour", () => {
    const [seafood] = pickHomeCategories(collections, cards);
    assert.equal(seafood.title, 'Seafood');
    assert.equal(seafood.icon, 'Fish');
    assert.match(seafood.color, /^#[0-9a-f]{6}$/i);
  });

  test('shows every stocked collection, however many there are', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ title: `Collection ${i}`, slug: `c-${i}` }));
    const stocked = many.map((c) => ({ slug: c.slug, productCount: 5 }));
    assert.equal(pickHomeCategories(many, stocked).length, 30);
  });

  test('copes with missing input', () => {
    assert.deepEqual(pickHomeCategories(undefined, undefined), []);
    assert.deepEqual(pickHomeCategories(collections, undefined), []);
  });
});
