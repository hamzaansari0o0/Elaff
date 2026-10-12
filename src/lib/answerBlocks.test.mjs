import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { countWords, homeAnswer, aboutAnswer, partnersAnswer, collectionAnswer, productAnswer } from './answerBlocks.js';

const inRange = (text, label) => {
  const n = countWords(text);
  assert.ok(n >= 30 && n <= 50, `${label}: ${n} words — "${text}"`);
};

describe('countWords', () => {
  test('counts real words, not stray symbols or extra spaces', () => {
    assert.equal(countWords('  Fish  &  chips — 10 kg  '), 4);
    assert.equal(countWords(''), 0);
    assert.equal(countWords(undefined), 0);
  });
});

describe('fixed pages', () => {
  test('home, about and partners answers are 30 to 50 words', () => {
    inRange(homeAnswer(), 'home');
    inRange(aboutAnswer(), 'about');
    inRange(partnersAnswer(), 'partners');
  });
});

describe('collectionAnswer', () => {
  test('is 30 to 50 words for short, long and empty collections', () => {
    inRange(collectionAnswer({ title: 'Tea' }, 12), 'short title');
    inRange(collectionAnswer({ title: 'Personal Care & Household Cleaning Supplies for Hotels' }, 3), 'long title');
    inRange(collectionAnswer({ title: 'Seafood' }, 0), 'no products');
  });

  test('states the real product count, and never claims products when there are none', () => {
    assert.match(collectionAnswer({ title: 'Seafood' }, 14), /14 products/);
    assert.match(collectionAnswer({ title: 'Seafood' }, 1), /1 product\b/);
    assert.doesNotMatch(collectionAnswer({ title: 'Seafood' }, 0), /\b0 products|\bproducts? (?:available|listed)/i);
  });
});

describe('productAnswer', () => {
  const base = { title: 'Frozen Mangoes' };

  test('is 30 to 50 words whatever data the product has', () => {
    inRange(productAnswer(base, 'Frozen Foods'), 'bare product');
    inRange(productAnswer(base, undefined), 'no collection');
    inRange(productAnswer({ title: 'X' }, ''), 'one-word title');
    inRange(
      productAnswer({ ...base, moq: '500-1000 ctns', leadTime: '7-14 days', shortDescription: 'Premium A grade frozen mango halves packed in 10kg cartons for export.' }, 'Frozen Foods'),
      'full data'
    );
    inRange(
      productAnswer({ title: 'Organic Frozen Pork Carcass with Ribs Stomach Belly Meat & Kidneys-Bulk Packaging', moq: '10 tons', leadTime: '14-21 days', shortDescription: 'x '.repeat(80) }, 'Meat & Poultry'),
      'long title with long description'
    );
  });

  test('copes with the very long, keyword-stuffed titles some products have', () => {
    const stuffed =
      'Source Direct Supply Wholesale Used Cooking Oil / Waste Vegetable Oil / Uco For Sale - Source United Kingdom Wholesale Premium Used Cooking Oil Wholesale and Bulk Used Cooking Oil Wholesale, Organic Used Cooking Oil Wholesale | Global Sources Exhibitions';
    inRange(productAnswer({ title: stuffed, moq: '10 tons' }, 'Cooking oil'), 'stuffed title');
    inRange(productAnswer({ title: 'Bulk Buy United Kingdom Wholesale Factory Price Original Perfect Grade Redbull Energy Drink 250ml | Buy Red Bull 250ml Cans In Bulk | Red Bull Supplier' }, 'Energy drinks'), 'pipe-separated title');
  });

  test('never writes "a" before a vowel sound such as "Energy drinks"', () => {
    for (const collection of ['Energy drinks', 'Animal feed', 'Agriculture']) {
      assert.doesNotMatch(productAnswer(base, collection), /\ba [AEIOUaeiou]/, collection);
    }
  });

  test('uses the stored minimum order and lead time when present, and invents none when absent', () => {
    const full = productAnswer({ ...base, moq: '500-1000 ctns', leadTime: '7-14 days' }, 'Frozen Foods');
    assert.match(full, /500-1000 ctns/);
    assert.match(full, /7-14 days/);
    const bare = productAnswer(base, 'Frozen Foods');
    assert.doesNotMatch(bare, /minimum order|lead time/i);
  });

  test('names the product and its collection', () => {
    const text = productAnswer(base, 'Frozen Foods');
    assert.ok(text.includes('Frozen Mangoes') && text.includes('Frozen Foods'));
  });
});
