import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadArticles, newestFirst } from './blog.js';

describe('newestFirst', () => {
  const entry = (overrides) => ({ date: '2026-01-01', updated: '2026-01-01', order: null, slug: 'x', ...overrides });

  test('the slug settles a full tie, whatever order the files were read in', () => {
    const first = entry({ slug: 'a' });
    const second = entry({ slug: 'b' });
    assert.deepEqual([second, first].sort(newestFirst).map((item) => item.slug), ['a', 'b']);
    assert.deepEqual([first, second].sort(newestFirst).map((item) => item.slug), ['a', 'b']);
  });

  test('a lower "order" beats a later update on the same day, and a missing one comes last', () => {
    const ordered = entry({ slug: 'z', order: 5 });
    const later = entry({ slug: 'a', updated: '2026-01-09' });
    assert.deepEqual([later, ordered].sort(newestFirst).map((item) => item.slug), ['z', 'a']);
  });
});

const article = ({ date, updated = date, title = 'T', order }) =>
  `---\ntitle: ${title}\ndescription: d\nkeyword: k\ndate: ${date}\nupdated: ${updated}\n${order ? `order: ${order}\n` : ''}---\nLead paragraph.\n`;

describe('loadArticles', () => {
  let dir;
  before(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'blog-test-'));
    writeFileSync(path.join(dir, 'old.md'), article({ date: '2026-01-01' }));
    writeFileSync(path.join(dir, 'newest.md'), article({ date: '2026-03-01' }));
    writeFileSync(path.join(dir, 'b-tie.md'), article({ date: '2026-02-01', updated: '2026-02-05' }));
    writeFileSync(path.join(dir, 'a-tie.md'), article({ date: '2026-02-01', updated: '2026-02-05' }));
    writeFileSync(path.join(dir, 'tie-updated-later.md'), article({ date: '2026-02-01', updated: '2026-02-09' }));
    writeFileSync(path.join(dir, 'ordered-second.md'), article({ date: '2026-02-01', order: 2 }));
    writeFileSync(path.join(dir, 'ordered-first.md'), article({ date: '2026-02-01', order: 1 }));
    writeFileSync(path.join(dir, 'README.txt'), 'not an article');
  });
  after(() => rmSync(dir, { recursive: true, force: true }));

  test('lists the markdown files newest first; on the same day an "order" number comes first, then the later update, then the slug', () => {
    assert.deepEqual(
      loadArticles(dir).map((entry) => entry.slug),
      ['newest', 'ordered-first', 'ordered-second', 'tie-updated-later', 'a-tie', 'b-tie', 'old']
    );
  });

  test('ignores files that are not markdown', () => {
    assert.ok(!loadArticles(dir).some((entry) => entry.slug.includes('README')));
  });

  test('a folder that is missing is an error, not an empty blog', () => {
    assert.throws(() => loadArticles(path.join(dir, 'nope')), /nope/);
  });

  test('a broken article stops the load and names its file', () => {
    const broken = mkdtempSync(path.join(tmpdir(), 'blog-test-'));
    try {
      writeFileSync(path.join(broken, 'bad-one.md'), '---\ntitle: Only a title\n---\nText.');
      assert.throws(() => loadArticles(broken), /bad-one\.md/);
    } finally {
      rmSync(broken, { recursive: true, force: true });
    }
  });
});
