import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseFrontMatter,
  splitFaq,
  renderMarkdown,
  leadParagraph,
  plainText,
  wordCount,
  readingMinutes,
  formatDate,
  parseArticle,
} from './blogParse.js';

describe('parseFrontMatter', () => {
  test('reads key: value lines and returns the body after the closing fence', () => {
    const { data, body } = parseFrontMatter('---\ntitle: Hello\nkeyword: rice\n---\nBody line.\n');
    assert.deepEqual(data, { title: 'Hello', keyword: 'rice' });
    assert.equal(body.trim(), 'Body line.');
  });

  test('splits at the first colon only, so a title may contain colons', () => {
    const { data } = parseFrontMatter("---\ntitle: Wholesale Rice: A Buyer's Guide\n---\nx");
    assert.equal(data.title, "Wholesale Rice: A Buyer's Guide");
  });

  test('trims values and removes one pair of matching quotes', () => {
    const { data } = parseFrontMatter('---\na:    spaced   \nb: "quoted: yes"\nc: \'single\'\nd: "unbalanced\n---\nx');
    assert.deepEqual(data, { a: 'spaced', b: 'quoted: yes', c: 'single', d: '"unbalanced' });
  });

  test('accepts Windows line endings and a byte-order mark', () => {
    const { data, body } = parseFrontMatter(String.fromCharCode(0xfeff) + '---\r\ntitle: Hi\r\n---\r\nFirst.\r\n\r\nSecond.\r\n');
    assert.deepEqual(data, { title: 'Hi' });
    assert.ok(!body.includes('\r'));
    assert.match(body, /First\.\n\nSecond\./);
  });

  test('ignores blank lines inside the block', () => {
    const { data } = parseFrontMatter('---\ntitle: Hi\n\nkeyword: k\n---\nx');
    assert.deepEqual(data, { title: 'Hi', keyword: 'k' });
  });

  test('fails clearly when the block is missing, unclosed, malformed or repeats a key', () => {
    assert.throws(() => parseFrontMatter('No fence here'), /must start with a "---" line/);
    assert.throws(() => parseFrontMatter('---\ntitle: Hi\nno closing fence'), /not closed/i);
    assert.throws(() => parseFrontMatter('---\njust text\n---\nx'), /"just text"/);
    assert.throws(() => parseFrontMatter('---\n: value\n---\nx'), /": value"/);
    assert.throws(() => parseFrontMatter('---\ntitle: A\ntitle: B\n---\nx'), /duplicate.*title/i);
  });
});

describe('plainText', () => {
  test('turns inline markdown into the words a reader sees', () => {
    assert.equal(plainText('See [our shop](/shop) for **bold** and *soft* and `code`.'), 'See our shop for bold and soft and code.');
  });

  test('collapses whitespace and line breaks', () => {
    assert.equal(plainText('one\n  two\n\nthree'), 'one two three');
  });

  test('keeps underscores inside words and asterisks used as multiplication', () => {
    assert.equal(plainText('snake_case 2*3'), 'snake_case 2*3');
  });
});

describe('splitFaq', () => {
  const body = [
    'Lead.',
    '',
    '## One',
    'Text.',
    '',
    '### A sub heading that is not a question',
    'More text.',
    '',
    '## Frequently asked questions',
    '',
    '### What is the MOQ?',
    'One pallet.',
    '',
    'It can vary.',
    '',
    '### How fast do you ship?',
    'We ship in **24 to 72 hours**, see [shipping](/contact).',
  ].join('\n');

  test('turns markup in a question into plain text too', () => {
    const { faq } = splitFaq(['x', '', '## Frequently asked questions', '### What is **IQF**, and `why`?', 'Answer.'].join('\n'));
    assert.equal(faq[0].question, 'What is IQF, and why?');
  });

  test('moves the FAQ section out of the body into question/answer items', () => {
    const { main, faq } = splitFaq(body);
    assert.deepEqual(faq, [
      { question: 'What is the MOQ?', answer: 'One pallet. It can vary.' },
      { question: 'How fast do you ship?', answer: 'We ship in 24 to 72 hours, see shipping.' },
    ]);
    assert.ok(!main.includes('Frequently'));
    assert.ok(main.includes('### A sub heading that is not a question'));
    assert.ok(main.trim().endsWith('More text.'));
  });

  test('matches the FAQ heading regardless of case and trailing spaces', () => {
    const { faq } = splitFaq('Lead.\n\n##   FREQUENTLY asked Questions  \n### Q?\nA.');
    assert.equal(faq.length, 1);
  });

  test('an article without a FAQ section keeps its whole body', () => {
    const { main, faq } = splitFaq('Lead.\n\n## One\nText.');
    assert.equal(main, 'Lead.\n\n## One\nText.');
    assert.deepEqual(faq, []);
  });

  test('the FAQ must be the last section', () => {
    assert.throws(() => splitFaq('Lead.\n\n## Frequently asked questions\n### Q?\nA.\n\n## After\nText.'), /last section/i);
  });

  test('every question needs an answer, and answers are plain paragraphs', () => {
    assert.throws(() => splitFaq('x\n\n## Frequently asked questions\n### Q?\n\n### R?\nA.'), /"Q\?".*no answer/i);
    assert.throws(() => splitFaq('x\n\n## Frequently asked questions\n### Q?\n- one\n- two'), /plain paragraphs/i);
    assert.throws(() => splitFaq('x\n\n## Frequently asked questions\nLoose text.\n### Q?\nA.'), /before the first question/i);
  });
});

describe('renderMarkdown', () => {
  test('renders headings, paragraphs, lists, tables and links', () => {
    const html = renderMarkdown(
      ['## Heading', '', 'A [link](/contact) here.', '', '- one', '- two', '', '| a | b |', '|---|---|', '| 1 | 2 |'].join('\n')
    );
    assert.match(html, /<h2>Heading<\/h2>/);
    assert.match(html, /<a href="\/contact">link<\/a>/);
    assert.match(html, /<ul>\s*<li>one<\/li>\s*<li>two<\/li>\s*<\/ul>/);
    assert.match(html, /<table>/);
    assert.match(html, /<td>2<\/td>/);
  });

  test('does not turn single newlines into line breaks', () => {
    assert.ok(!renderMarkdown('one\ntwo').includes('<br'));
  });

  test('puts each table in a scrolling box so a wide table cannot widen a phone screen', () => {
    const html = renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |\n\nText.\n\n| c |\n|---|\n| 3 |');
    assert.equal(html.match(/<div class="blog-table"><table>/g).length, 2);
    assert.equal(html.match(/<\/table><\/div>/g).length, 2);
    assert.ok(!renderMarkdown('No table here.').includes('blog-table'));
  });
});

describe('formatDate', () => {
  test('writes a date the way a reader expects, whatever the server time zone', () => {
    assert.equal(formatDate('2026-10-14'), '14 October 2026');
    assert.equal(formatDate('2026-01-05'), '5 January 2026');
    assert.equal(formatDate('2026-12-31'), '31 December 2026');
  });

  test('hands back text that is not a date unchanged', () => {
    assert.equal(formatDate('soon'), 'soon');
  });
});

describe('leadParagraph', () => {
  test('is the first paragraph as plain text', () => {
    assert.equal(leadParagraph('The **answer** is [here](/shop).\nStill the same paragraph.\n\n## Next'), 'The answer is here. Still the same paragraph.');
  });

  test('is null when the body opens with anything other than a paragraph', () => {
    for (const body of ['## Heading\ntext', '- item', '1. item', '> quote', '| a |\n|---|', '', '   \n\n']) {
      assert.equal(leadParagraph(body), null, JSON.stringify(body));
    }
  });
});

describe('wordCount and readingMinutes', () => {
  test('counts words, not punctuation, and keeps apostrophes and hyphens inside a word', () => {
    assert.equal(wordCount("Don't count - or | dashes; it's well-known."), 6);
    assert.equal(wordCount('  '), 0);
  });

  test('reading time is 200 words a minute, rounded up, never below one minute', () => {
    assert.equal(readingMinutes(0), 1);
    assert.equal(readingMinutes(200), 1);
    assert.equal(readingMinutes(201), 2);
    assert.equal(readingMinutes(1000), 5);
  });
});

describe('parseArticle', () => {
  const source = (overrides = {}, body) => {
    const fields = {
      title: "Frozen Rice: A Buyer's Guide",
      description: 'How bulk buyers choose frozen rice.',
      keyword: 'frozen rice wholesale',
      keywords: 'bulk rice, rice supplier',
      date: '2026-10-14',
      updated: '2026-10-20',
      collections: 'grocery, frozen-foods',
      products: 'basmati-rice',
      ...overrides,
    };
    const head = Object.entries(fields)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    return `---\n${head}\n---\n${
      body ??
      'Frozen rice is bought by the pallet.\n\n## Why it matters\nBecause [shipping](/contact) is fast.\n\n## Frequently asked questions\n### Is there a MOQ?\nOne pallet.'
    }`;
  };

  test('returns the article with everything the pages need', () => {
    const article = parseArticle(source(), 'frozen-rice.md');
    assert.equal(article.slug, 'frozen-rice');
    assert.equal(article.title, "Frozen Rice: A Buyer's Guide");
    assert.equal(article.description, 'How bulk buyers choose frozen rice.');
    assert.equal(article.keyword, 'frozen rice wholesale');
    assert.deepEqual(article.keywords, ['bulk rice', 'rice supplier']);
    assert.equal(article.date, '2026-10-14');
    assert.equal(article.updated, '2026-10-20');
    assert.deepEqual(article.collections, ['grocery', 'frozen-foods']);
    assert.deepEqual(article.products, ['basmati-rice']);
    assert.equal(article.lead, 'Frozen rice is bought by the pallet.');
    assert.match(article.html, /<h2>Why it matters<\/h2>/);
    assert.ok(!article.html.includes('Is there a MOQ'));
    assert.deepEqual(article.faq, [{ question: 'Is there a MOQ?', answer: 'One pallet.' }]);
    assert.equal(article.readingMinutes, 1);
  });

  test('counts the words a visitor reads: body and FAQ, without markup', () => {
    // body: "Frozen rice is bought by the pallet." (7) + "Why it matters" (3) + "Because shipping is fast." (4)
    // faq: "Is there a MOQ?" (4) + "One pallet." (2)
    assert.equal(parseArticle(source(), 'frozen-rice.md').wordCount, 20);
  });

  test('optional fields may be left out', () => {
    const article = parseArticle(source({ keywords: undefined, collections: undefined, products: undefined }), 'frozen-rice.md');
    assert.deepEqual(article.keywords, []);
    assert.deepEqual(article.collections, []);
    assert.deepEqual(article.products, []);
  });

  test('an optional "order" number settles which of several same-day articles is listed first', () => {
    assert.equal(parseArticle(source({ order: '3' }), 'a.md').order, 3);
    assert.equal(parseArticle(source(), 'a.md').order, null);
    for (const bad of ['first', '0', '-1', '2.5', '1e3']) {
      assert.throws(() => parseArticle(source({ order: bad }), 'a.md'), /"order".*whole number/, bad);
    }
  });

  test('an empty list value is an empty list', () => {
    assert.deepEqual(parseArticle(source({ products: ' , ' }), 'a.md').products, []);
  });

  test('every error names the file', () => {
    const cases = [
      [source({ title: undefined }), /title/],
      [source({ description: '' }), /description/],
      [source({ keyword: undefined }), /keyword/],
      [source({ date: undefined }), /date/],
      [source({ updated: undefined }), /updated/],
      [source({ colour: 'blue' }), /unknown field "colour"/],
      [source({ date: '14-10-2026' }), /"date" must look like/],
      [source({ date: '2026-02-30' }), /not a real date/],
      [source({ updated: '2026-10-01' }), /before/],
      [source({ collections: 'Meat Poultry' }), /collections/],
      [source({}, '## Heading first\nText.'), /open with a paragraph/],
      [source({}, 'Lead.\n\n# A second h1\nText.'), /h1/i],
      [source({}, 'Lead.\n\n<script>alert(1)</script>'), /raw HTML/i],
      [source({}, 'Lead.\n\n<!-- hidden -->'), /raw HTML/i],
    ];
    for (const [text, pattern] of cases) {
      assert.throws(() => parseArticle(text, 'broken-file.md'), (error) => {
        assert.match(error.message, /broken-file\.md/);
        assert.match(error.message, pattern);
        return true;
      });
    }
  });

  test('the filename must be a clean slug', () => {
    assert.throws(() => parseArticle(source(), 'Bad Name.md'), /slug/i);
    assert.throws(() => parseArticle(source(), 'notmarkdown.txt'), /\.md/);
  });

  test('"<" used as a comparison is not mistaken for HTML', () => {
    const article = parseArticle(source({}, 'Keep it below 5 < 6 always.\n\n## A\nText.'), 'cmp.md');
    assert.match(article.html, /5 &lt; 6/);
  });
});
