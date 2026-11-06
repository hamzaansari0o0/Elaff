import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { toCardShape } from './cardShape.js';

// A product as the storefront receives it from the database (already serialised).
function product(overrides = {}) {
  return {
    id: 'p1',
    slug: 'pepsi-330ml-can',
    title: 'Pepsi 330ml Can',
    category: 'Soft Drinks',
    price: null,
    priceUnit: '',
    oldPrice: null,
    images: ['https://res.cloudinary.com/demo/image/upload/v1/pepsi-1.jpg', 'https://res.cloudinary.com/demo/image/upload/v1/pepsi-2.jpg'],
    badge: '',
    tags: [],
    ...overrides,
  };
}

describe('toCardShape: fields every card already relied on', () => {
  test('formats a priced product for display', () => {
    const card = toCardShape(product({ price: 14.95, priceUnit: ' / case', oldPrice: 18 }));
    assert.equal(card.price, '$14.95 / case');
    assert.equal(card.priceValue, 14.95);
    assert.equal(card.oldPrice, '$18.00');
  });

  test('keeps identity, shouting category and the first image only', () => {
    const card = toCardShape(product());
    assert.equal(card.id, 'p1');
    assert.equal(card.slug, 'pepsi-330ml-can');
    assert.equal(card.title, 'Pepsi 330ml Can');
    assert.equal(card.category, 'SOFT DRINKS');
    assert.equal(card.image, 'https://res.cloudinary.com/demo/image/upload/v1/pepsi-1.jpg');
  });

  test('copes with the usual unpriced, imageless product', () => {
    const card = toCardShape(product({ price: null, images: [], category: undefined }));
    assert.equal(card.price, undefined);
    assert.equal(card.priceValue, null);
    assert.equal(card.oldPrice, undefined);
    assert.equal(card.image, '');
    assert.equal(card.category, '');
  });

  test('turns a blank badge into no badge, and keeps a real one', () => {
    assert.equal(toCardShape(product({ badge: '' })).badge, undefined);
    assert.equal(toCardShape(product({ badge: 'HOT' })).badge, 'HOT');
  });
});

describe('toCardShape: the price unit', () => {
  test('is passed through so a card can show "/ ton" smaller than the amount', () => {
    assert.equal(toCardShape(product({ price: 205, priceUnit: ' / ton' })).priceUnit, ' / ton');
  });

  test('is an empty string when the product has none', () => {
    assert.equal(toCardShape(product({ price: 205, priceUnit: undefined })).priceUnit, '');
  });
});

describe('toCardShape: when a card counts as on sale', () => {
  test('a product tagged onSale is on sale even though it has no prices to compare', () => {
    const card = toCardShape(product({ tags: ['bestseller', 'onSale'] }));
    assert.equal(card.onSale, true);
  });

  test('a product whose old price is higher is on sale without the tag', () => {
    const card = toCardShape(product({ price: 14.95, oldPrice: 18, tags: [] }));
    assert.equal(card.onSale, true);
  });

  test('an ordinary product, even a bestseller, is not on sale', () => {
    assert.equal(toCardShape(product({ tags: ['bestseller'] })).onSale, false);
  });

  test('an old price that is not higher does not make a product on sale', () => {
    assert.equal(toCardShape(product({ price: 18, oldPrice: 14.6 })).onSale, false);
  });

  test('copes with a product that has no tags at all', () => {
    assert.equal(toCardShape(product({ tags: undefined })).onSale, false);
  });
});

describe('toCardShape: whether the old price may be shown struck through', () => {
  test('is true only for a genuine reduction', () => {
    assert.equal(toCardShape(product({ price: 14.95, oldPrice: 18 })).discounted, true);
  });

  test('is false for a product that is only tagged onSale, so no made-up "was" price appears', () => {
    assert.equal(toCardShape(product({ tags: ['onSale'] })).discounted, false);
  });

  test('is false when the "old" price is lower than the current one', () => {
    assert.equal(toCardShape(product({ price: 18, oldPrice: 14.6, tags: ['onSale'] })).discounted, false);
  });
});
