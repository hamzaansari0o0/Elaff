import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { hasDiscount } from './formatPrice.js';

// The home page shows a sale badge on a product when its old price is higher than its current one.
describe('hasDiscount', () => {
  test('is true when the old price is higher than the current price', () => {
    assert.equal(hasDiscount(14.95, 18), true);
  });

  test('is false when the old price equals the current price', () => {
    assert.equal(hasDiscount(18, 18), false);
  });

  test('is false when the old price is lower than the current price (a price rise is not a sale)', () => {
    assert.equal(hasDiscount(20, 14.6), false);
  });

  test('is false when there is no old price', () => {
    assert.equal(hasDiscount(14.95, null), false);
    assert.equal(hasDiscount(14.95, undefined), false);
  });

  test('is false when there is no current price, since nothing can be shown as reduced', () => {
    assert.equal(hasDiscount(null, 18), false);
    assert.equal(hasDiscount(undefined, 18), false);
  });

  test('does not treat numeric strings or NaN as prices', () => {
    assert.equal(hasDiscount('14.95', '18'), false);
    assert.equal(hasDiscount(NaN, 18), false);
  });
});
