// Turns a blog article file (content/blog/<slug>.md) into the data the blog
// pages need. Pure functions, no file access, so they are tested on their own;
// lib/blog.js reads the files and calls parseArticle. A problem in an article
// throws an error that names the file, so a broken article fails the build
// instead of reaching visitors.
// (Imports carry a ".js" extension so Node's test runner can load this file.)
import { Marked } from 'marked';
import { stripHtml } from './seo.js';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const REQUIRED_FIELDS = ['title', 'description', 'keyword', 'date', 'updated'];
const OPTIONAL_FIELDS = ['keywords', 'collections', 'products', 'order'];
const FAQ_HEADING = /^##\s+frequently asked questions\s*$/i;

// The block of "key: value" lines between the two "---" lines at the top of a
// file, and what follows it. Splits each line at its FIRST colon, so a title
// like "Rice: A Buyer's Guide" keeps its colon.
export function parseFrontMatter(source) {
  const lines = String(source).replace(/\r\n?/g, '\n').split('\n');
  // trim() also drops the invisible byte-order mark some Windows editors put first.
  if (lines[0].trim() !== '---') {
    throw new Error('missing front matter: the file must start with a "---" line');
  }

  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
  if (end === -1) throw new Error('front matter is not closed with a second "---" line');

  const data = {};
  for (const raw of lines.slice(1, end)) {
    const line = raw.trim();
    if (!line) continue;

    const colon = line.indexOf(':');
    if (colon <= 0) throw new Error(`front matter line "${line}" is not in the form "key: value"`);

    const key = line.slice(0, colon).trim();
    if (key in data) throw new Error(`duplicate front matter field "${key}"`);

    let value = line.slice(colon + 1).trim();
    if (value.length >= 2 && (value[0] === '"' || value[0] === "'") && value.at(-1) === value[0]) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: lines.slice(end + 1).join('\n') };
}

// The words a reader sees, from a line or paragraph of inline Markdown.
export function plainText(markdown = '') {
  return String(markdown)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/(\*\*|__)(.+?)\1/g, '$2')
    .replace(/(^|[^\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)/g, '$1$2')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Cuts the "Frequently asked questions" section out of the body. Each "###"
// under it is a question; the text below it is the answer. Answers are kept as
// plain text because the page shows them in a list and publishes the same text
// as FAQ structured data, and the two must match word for word.
export function splitFaq(body) {
  const lines = body.split('\n');
  const start = lines.findIndex((line) => FAQ_HEADING.test(line.trim()));
  if (start === -1) return { main: body, faq: [] };

  const rest = lines.slice(start + 1);
  if (rest.some((line) => /^##\s/.test(line))) {
    throw new Error('the "Frequently asked questions" section must be the last section');
  }

  const items = [];
  for (const line of rest) {
    const heading = line.match(/^###\s+(.+?)\s*$/);
    if (heading) {
      items.push({ question: heading[1], lines: [] });
    } else if (items.length > 0) {
      items.at(-1).lines.push(line);
    } else if (line.trim()) {
      throw new Error('there is text under "Frequently asked questions" before the first question');
    }
  }

  const faq = items.map(({ question, lines: answerLines }) => {
    const block = answerLines.join('\n').trim();
    if (!block) throw new Error(`the FAQ question "${question}" has no answer`);
    if (/^\s*([-*+]|\d+[.)])\s/m.test(block) || /^\s*[|>]/m.test(block)) {
      throw new Error(`the FAQ answer to "${question}" must be plain paragraphs (no lists, tables or quotes)`);
    }
    return { question: plainText(question), answer: plainText(block) };
  });

  return { main: lines.slice(0, start).join('\n').replace(/\s+$/, ''), faq };
}

const markdown = new Marked({ gfm: true, breaks: false });

// Raw HTML is not allowed in articles, so a literal "<table>" in the output is
// always one Markdown made; wrapping those lets a wide table scroll sideways
// inside its own box instead of stretching the page on a phone.
export function renderMarkdown(text) {
  return markdown
    .parse(text, { async: false })
    .replace(/<table>/g, '<div class="blog-table"><table>')
    .replace(/<\/table>/g, '</table></div>');
}

// The first paragraph as plain text: the direct answer that opens an article.
// Null when the body opens with something else (a heading, list, table, quote).
export function leadParagraph(main) {
  const first = main.trim().split(/\n\s*\n/)[0];
  if (!first || /^(#|[-*+]\s|\d+[.)]\s|>|\||```)/.test(first)) return null;
  return plainText(first);
}

export function wordCount(text) {
  return (String(text).match(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*/gu) || []).length;
}

const WORDS_PER_MINUTE = 200;

export function readingMinutes(words) {
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// "2026-10-14" as "14 October 2026". Read in UTC so the day never shifts with
// the server's time zone.
export function formatDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date);
}

const list = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

// `filename` is the file's name inside content/blog (for example
// "frozen-rice.md"); without the ".md" it is the article's address.
export function parseArticle(source, filename) {
  const fail = (message) => {
    throw new Error(`content/blog/${filename}: ${message}`);
  };
  const attempt = (work) => {
    try {
      return work();
    } catch (error) {
      return fail(error.message);
    }
  };

  if (!filename.endsWith('.md')) fail('a blog file must end in .md');
  const slug = filename.slice(0, -'.md'.length);
  if (!SLUG.test(slug)) fail(`"${slug}" is not a valid slug (use lowercase letters, numbers and hyphens)`);

  const { data, body } = attempt(() => parseFrontMatter(source));

  for (const key of Object.keys(data)) {
    if (![...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].includes(key)) fail(`unknown field "${key}"`);
  }
  for (const key of REQUIRED_FIELDS) {
    if (!data[key]) fail(`"${key}" is required`);
  }

  for (const key of ['date', 'updated']) {
    if (!DATE.test(data[key])) fail(`"${key}" must look like 2026-10-14`);
    const parsed = new Date(`${data[key]}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== data[key]) {
      fail(`"${key}" is not a real date`);
    }
  }
  if (data.updated < data.date) fail('"updated" is before "date"');

  if (data.order !== undefined && !/^[1-9]\d*$/.test(data.order)) fail('"order" must be a whole number from 1');

  const collections = list(data.collections);
  const products = list(data.products);
  for (const [field, slugs] of [['collections', collections], ['products', products]]) {
    const bad = slugs.find((item) => !SLUG.test(item));
    if (bad) fail(`"${field}" has "${bad}", which is not a slug`);
  }

  if (/<\/?[a-z][^>]*>|<!--/i.test(body)) fail('raw HTML is not allowed in articles; use Markdown');
  if (/^#\s/m.test(body)) fail('the body must not contain an h1 ("# ..."); the title is the h1');

  const { main, faq } = attempt(() => splitFaq(body));
  const lead = leadParagraph(main);
  if (!lead) fail('the article must open with a paragraph (the direct answer), not a heading or list');

  const html = renderMarkdown(main);
  const words = wordCount(stripHtml(html)) + faq.reduce((sum, { question, answer }) => sum + wordCount(`${question} ${answer}`), 0);

  return {
    slug,
    title: data.title,
    description: data.description,
    keyword: data.keyword,
    keywords: list(data.keywords),
    date: data.date,
    updated: data.updated,
    order: data.order === undefined ? null : Number(data.order),
    collections,
    products,
    lead,
    html,
    faq,
    wordCount: words,
    readingMinutes: readingMinutes(words),
  };
}
