import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { loadArticles } from './blog.js';
import { wordCount } from './blogParse.js';
import { stripHtml } from './seo.js';

// Checks the real articles in content/blog, so a typo or a bad link fails
// `npm test` (and the build) rather than reaching visitors.
const dir = fileURLToPath(new URL('../../content/blog', import.meta.url));
const articles = loadArticles(dir);
const slugs = new Set(articles.map((article) => article.slug));

// The ten articles the blog launched with.
const LAUNCH_SLUGS = [
  'frozen-chicken-leg-quarter-wholesale-guide',
  'frozen-mango-pulp-wholesale',
  'frozen-strawberry-wholesale',
  'wholesale-mozzarella-shredded-vs-block',
  'buying-fresh-fruit-in-bulk',
  'ship-frozen-food-internationally',
  'exw-vs-fob-vs-cnf',
  'halal-haccp-certification-importers',
  'import-food-from-one-pallet',
  'choose-reliable-wholesale-food-supplier',
];

// Pages that exist on the live site (checked 2026-10-12). Articles may link only to these
// and to each other, so a renamed collection or product shows up here instead of as a 404.
const COLLECTIONS = [
  'agriculture', 'animal-feed', 'baby-food-general-supplies', 'coffee-drinks', 'condiments-edible-oil',
  'confectionery', 'cooking-oil', 'energy-drinks', 'food-beverages', 'fresh-fruits', 'fresh-vegetables',
  'frozen-foods', 'maternity-baby-care-products', 'meat-poultry', 'personal-care-household-cleaning',
  'plant-animal-oil', 'seafood', 'soft-drinks',
];
const PRODUCTS = [
  'apples-fuji-juicey',
  'fozen-mozzarella-cheese-block',
  'fresh-red-grapes-global',
  'fresh-sweet-mandarins-from-valencia-grade-a',
  'frozen-chicken-breast-boneless',
  'frozen-chicken-drum-stick',
  'frozen-chicken-leg-quarter',
  'frozen-chicken-whole-grill',
  'frozen-mangoes',
  'frozen-mozzarella-cheese-sherded',
  'frozen-strawberry',
  'pomegranate',
];
const FIXED_PAGES = ['/contact', '/shop', '/about'];

const sourceOf = (article) => readFileSync(path.join(dir, `${article.slug}.md`), 'utf8');
const linksIn = (source) => [...source.matchAll(/\]\(([^)\s]*)\)/g)].map((match) => match[1]);
const visibleText = (article) => `${stripHtml(article.html)} ${article.faq.map((item) => `${item.question} ${item.answer}`).join(' ')}`;

describe('the launch articles', () => {
  test('are all present', () => {
    for (const slug of LAUNCH_SLUGS) assert.ok(slugs.has(slug), `${slug} is missing from content/blog`);
  });

  test('add up to about 10,000 words', () => {
    const total = articles
      .filter((article) => LAUNCH_SLUGS.includes(article.slug))
      .reduce((sum, article) => sum + article.wordCount, 0);
    assert.ok(total >= 9500 && total <= 10500, `the ten articles total ${total} words`);
  });
});

describe('every article', () => {
  test('has its own title, description and primary keyword', () => {
    for (const field of ['title', 'description', 'keyword']) {
      const values = articles.map((article) => article[field].toLowerCase());
      assert.equal(new Set(values).size, values.length, `two articles share a ${field}`);
    }
  });

  test('has a description that fits a search result', () => {
    for (const { slug, description } of articles) {
      assert.ok(description.length >= 70 && description.length <= 155, `${slug}: description is ${description.length} characters`);
    }
  });

  test('opens with a direct answer of 30 to 55 words', () => {
    for (const { slug, lead } of articles) {
      const words = wordCount(lead);
      assert.ok(words >= 30 && words <= 55, `${slug}: the opening answer is ${words} words`);
    }
  });

  test('is 800 to 1,200 words long', () => {
    for (const { slug, wordCount: words } of articles) {
      assert.ok(words >= 800 && words <= 1200, `${slug}: ${words} words`);
    }
  });

  test('has several headings and at least four FAQ items', () => {
    for (const { slug, html, faq } of articles) {
      assert.ok((html.match(/<h2>/g) || []).length >= 5, `${slug}: fewer than five sections`);
      assert.ok(faq.length >= 4, `${slug}: only ${faq.length} FAQ items`);
    }
  });

  test('has no empty headings and no leftover placeholder text', () => {
    for (const article of articles) {
      assert.ok(!/<h[2-3]>\s*<\/h[2-3]>/.test(article.html), `${article.slug}: empty heading`);
      assert.ok(!/\b(TBD|TODO|lorem ipsum|XXX)\b/i.test(sourceOf(article)), `${article.slug}: placeholder text`);
    }
  });

  test('uses its primary keyword in the title or the text', () => {
    for (const article of articles) {
      const haystack = `${article.title} ${visibleText(article)}`.toLowerCase();
      assert.ok(haystack.includes(article.keyword.toLowerCase()), `${article.slug}: never says "${article.keyword}"`);
    }
  });

  test('keeps markup out of the FAQ answers, which are published as plain text', () => {
    for (const { slug, faq } of articles) {
      for (const { question, answer } of faq) {
        assert.ok(!/[*`]|\]\(|<|#/.test(`${question} ${answer}`), `${slug}: markup in the FAQ "${question}"`);
      }
    }
  });

  test('makes no prices, guarantees or unprovable superlatives', () => {
    for (const article of articles) {
      const text = visibleText(article);
      assert.ok(!/(\$|USD|US\$)\s?\d/i.test(text), `${article.slug}: a price figure`);
      assert.ok(
        !/\b(guarantee[sd]?|cheapest|lowest price|best price|number one|world['’]s best)\b/i.test(text),
        `${article.slug}: a claim that cannot be backed up`
      );
    }
  });

  test('is dated, and not in the future', () => {
    const today = new Date().toISOString().slice(0, 10);
    for (const { slug, date, updated } of articles) {
      assert.ok(date <= today && updated <= today, `${slug}: dated after today`);
    }
  });
});

describe('links and related pages in the articles', () => {
  test('every link goes to a page that exists, and none leave the site', () => {
    for (const article of articles) {
      for (const link of linksIn(sourceOf(article))) {
        const known =
          FIXED_PAGES.includes(link) ||
          (link.startsWith('/collection/') && COLLECTIONS.includes(link.slice('/collection/'.length))) ||
          (link.startsWith('/product/') && PRODUCTS.includes(link.slice('/product/'.length))) ||
          (link.startsWith('/blog/') && slugs.has(link.slice('/blog/'.length)));
        assert.ok(
          known,
          `${article.slug}: link to ${link} does not point at a known page. If the page exists on the live site, add its slug to COLLECTIONS or PRODUCTS at the top of this file.`
        );
        assert.notEqual(link, `/blog/${article.slug}`, `${article.slug} links to itself`);
      }
    }
  });

  test('each article links to the inquiry page, to the catalog and to another guide', () => {
    for (const article of articles) {
      const links = linksIn(sourceOf(article));
      assert.ok(links.includes('/contact'), `${article.slug}: no link to /contact`);
      assert.ok(links.filter((link) => /^\/(collection|product)\//.test(link)).length >= 2, `${article.slug}: fewer than two catalog links`);
      assert.ok(links.some((link) => link.startsWith('/blog/')), `${article.slug}: no link to another guide`);
    }
  });

  test('the collections and products named in the front matter exist', () => {
    for (const { slug, collections, products } of articles) {
      for (const item of collections) assert.ok(COLLECTIONS.includes(item), `${slug}: unknown collection ${item} (add it to COLLECTIONS at the top of this file if it exists on the live site)`);
      for (const item of products) assert.ok(PRODUCTS.includes(item), `${slug}: unknown product ${item} (add it to PRODUCTS at the top of this file if it exists on the live site)`);
    }
  });
});

describe('the content folder', () => {
  test('holds only markdown articles', () => {
    for (const name of readdirSync(dir)) assert.ok(name.endsWith('.md'), `${name} is not a .md file`);
  });
});
