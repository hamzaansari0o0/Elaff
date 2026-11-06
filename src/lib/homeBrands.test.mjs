import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRANDS, pickHomeBrands } from './homeBrands.js';

const PUBLIC_DIR = fileURLToPath(new URL('../../public/', import.meta.url));
const names = (list) => list.map((b) => b.name);

// A small brand list of our own, so these tests say what the picking logic does
// without depending on whatever is in the shipped list.
const brands = [
  { name: 'Pepsi', logo: '/b/pepsi.png', terms: ['Pepsi'] },
  { name: 'Mars', logo: '/b/mars.png', terms: ['Mars'] },
  { name: 'illy', logo: '/b/illy.png', terms: ['illy'], search: 'illy coffee' },
  { name: 'Coca-Cola', logo: '/b/coke.png', terms: ['Coca Cola', 'Coca-Cola'] },
  { name: "M&M's", logo: '/b/mm.png', terms: ['M&M'] },
  { name: 'Nescafe', logo: '/b/nescafe.png', terms: ['Nescafe', 'Nescafé'] },
  { name: 'Fanta', logo: '/b/fanta.png' }, // no terms: matched by its name
];

describe('pickHomeBrands: which brands appear', () => {
  test('shows a brand named in a product title, with its logo and a link to that brand\'s products', () => {
    const [pepsi] = pickHomeBrands(['Premium Quality Pepsi 330ml 355ml 500ml Can'], brands);
    assert.equal(pepsi.name, 'Pepsi');
    assert.equal(pepsi.logo, '/b/pepsi.png');
    assert.equal(pepsi.href, '/shop?search=Pepsi');
  });

  test('leaves out brands no product mentions, so a tile never opens an empty page', () => {
    assert.deepEqual(names(pickHomeBrands(['Pepsi 330ml'], brands)), ['Pepsi']);
  });

  test('matches whole words only: Marshmallow is not Mars, and Chilly sauce is not illy', () => {
    assert.deepEqual(pickHomeBrands(['Marshmallow Fluff 500g', 'Chilly Sauce 200ml', 'Commercial Grade Pepsin'], brands), []);
  });

  test('still matches when the brand is joined to punctuation or other words by a separator', () => {
    assert.deepEqual(names(pickHomeBrands(['Pepsi-Cola 330ml', 'Wholesale (Fanta) 500ml', 'Mars, Twix & more'], brands)), ['Fanta', 'Mars', 'Pepsi']);
  });

  test('ignores capitalisation', () => {
    assert.deepEqual(names(pickHomeBrands(['PEPSI MAX 330ml', 'fanta orange'], brands)), ['Fanta', 'Pepsi']);
  });

  test('matches the brand by its name when the entry lists no other spellings', () => {
    assert.deepEqual(names(pickHomeBrands(['Fanta Orange 330ml'], brands)), ['Fanta']);
  });

  test('matches an accented spelling', () => {
    assert.deepEqual(names(pickHomeBrands(['Nescafé Gold 200g'], brands)), ['Nescafe']);
  });

  test('matches a brand whose name contains punctuation, with or without its trailing \'s', () => {
    assert.deepEqual(names(pickHomeBrands(['Premium Quality M&M 45g 150g'], brands)), ["M&M's"]);
    assert.deepEqual(names(pickHomeBrands(["M&M's Peanut 200g"], brands)), ["M&M's"]);
  });

  test('copes with missing input and titles that are not text', () => {
    assert.deepEqual(pickHomeBrands(undefined, brands), []);
    assert.deepEqual(pickHomeBrands([undefined, null, 42, '', '   '], brands), []);
  });
});

describe('pickHomeBrands: order and counts', () => {
  test('puts the brand with the most products first, breaking ties alphabetically', () => {
    const titles = ['Pepsi 330ml', 'Pepsi 500ml', 'Pepsi Max', 'Mars Bar', 'Fanta Orange'];
    const picked = pickHomeBrands(titles, brands);
    assert.deepEqual(names(picked), ['Pepsi', 'Fanta', 'Mars']);
    assert.equal(picked[0].count, 3);
  });

  test('counts a product once even if it names the brand twice or in two spellings', () => {
    const [coke] = pickHomeBrands(['Coca Cola Zero - Coca-Cola Company'], brands);
    assert.equal(coke.count, 1);
  });

  test('counts a product for each brand it names', () => {
    assert.deepEqual(names(pickHomeBrands(['Fanta and Pepsi Mixed Pack'], brands)), ['Fanta', 'Pepsi']);
  });
});

describe('pickHomeBrands: the link to a brand\'s products', () => {
  test('searches with the spelling most products use', () => {
    const spaced = pickHomeBrands(['Coca Cola Drink', 'Coca Cola Zero', 'Coca-Cola Classic'], brands);
    assert.equal(spaced[0].href, '/shop?search=Coca%20Cola');

    const hyphenated = pickHomeBrands(['Coca-Cola Drink', 'Coca-Cola Zero', 'Coca Cola Classic'], brands);
    assert.equal(hyphenated[0].href, '/shop?search=Coca-Cola');
  });

  test('uses an entry\'s own search words when it has them, to keep unrelated products out', () => {
    const [illy] = pickHomeBrands(['Illy Coffee Premium Quality Beans'], brands);
    assert.equal(illy.href, '/shop?search=illy%20coffee');
  });

  test('encodes characters that would otherwise break the link', () => {
    const [mm] = pickHomeBrands(['Premium Quality M&M 45g'], brands);
    assert.equal(mm.href, '/shop?search=M%26M');
    const [nescafe] = pickHomeBrands(['Nescafé Gold 200g'], brands);
    assert.equal(nescafe.href, '/shop?search=Nescaf%C3%A9');
  });
});

describe('the shipped brand list', () => {
  test('every logo is a real file under public/, so no tile shows a broken image', () => {
    const missing = BRANDS.filter((b) => !fs.existsSync(path.join(PUBLIC_DIR, decodeURIComponent(b.logo))));
    assert.deepEqual(names(missing), []);
  });

  test('every logo URL is fully encoded, so spaces and full-width letters in file names do not break it', () => {
    const unsafe = BRANDS.filter((b) => !/^[\x21-\x7e]+$/.test(b.logo));
    assert.deepEqual(names(unsafe), []);
  });

  test('no brand is listed twice, which would show two identical tiles', () => {
    const lower = BRANDS.map((b) => b.name.toLowerCase());
    assert.equal(new Set(lower).size, lower.length);
  });

  // Real titles from the catalogue (trimmed): the list must recognise how products are actually named.
  const catalogue = [
    ['Premium Quality Pepsi 330ml 355ml 500ml Can', ['Pepsi']],
    ['Source Coca Cola Classic Carbonated Soft Drink - United Kingdom Wholesale Coca Cola Original', ['Coca-Cola']],
    ['Premium Quality Wholesale NIVEA Deo Stick 40ml For Men Silver Protect Long Lasting Sweat Defense', ['Nivea']],
    ['Fairy Caps 358gr Platinum 24 Lemon powerful dishwasher cleaning capsules', ['Fairy']],
    ['Bulk Buy United Kingdom Wholesale Factory Price Original Perfect Grade Redbull Energy Drink 250ml | Buy Red Bull 250ml Cans In Bulk', ['Red Bull']],
    ['Premium Quality M&M 45g 150g', ["M&M's"]],
    ['Fresh Jacobs Kronung Ground Coffee 250g And 500g Premium Buy Wholesale', ['Jacobs']],
    ['Nutella Ferrero chocolate Spread 350gr', ['Ferrero', 'Nutella']],
    ['Source High Quality Bounty Chocolate, Coconut Filled Chocolate, 57gm, 24 Bars Box', ['Bounty']],
    ['Nescafe Gold Original Blended Instant Coffee Jar 200g', ['Nescafe']],
    ['Buy Oreos Biscuit Cookies Original Chocolate And Vanilla 64.4g', ['Oreo']],
    ['Knoppers High Quality Solid Semi-Sweet Chocolate With Milk Cream Hazelnut Biscuit', ['Knoppers']],
    // "Commercial" contains "merci"; "Premium" contains "mium" — neither is a brand
    ['Wholesale Premium Quality Refined Corn Oil Edible Crude Corn Oil for Commercial Use', []],
  ];

  for (const [title, expected] of catalogue) {
    test(`recognises: ${title.slice(0, 60)}`, () => {
      assert.deepEqual(names(pickHomeBrands([title])).sort(), expected);
    });
  }
});
