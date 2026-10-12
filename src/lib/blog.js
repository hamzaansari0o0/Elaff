// Reads the blog articles from content/blog. Server-only (uses the file system).
// The parsing itself lives in lib/blogParse.js.
// (Imports carry a ".js" extension so Node's test runner can load this file.)
import { cache } from 'react';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArticle } from './blogParse.js';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

// Newest first. Articles published on the same day go by their "order" number
// (lowest first, articles without one last), then to the later update, then to
// the slug, so the order never changes between builds.
export function newestFirst(a, b) {
  return (
    b.date.localeCompare(a.date) ||
    (a.order ?? Infinity) - (b.order ?? Infinity) ||
    b.updated.localeCompare(a.updated) ||
    a.slug.localeCompare(b.slug)
  );
}

// A folder that cannot be read throws instead of yielding an empty blog: pages
// regenerate in the background, and an empty result would quietly replace good
// pages with a blog that has no articles.
export function loadArticles(dir) {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => parseArticle(readFileSync(path.join(dir, name), 'utf8'), name))
    .sort(newestFirst);
}

export const getAllArticles = cache(() => loadArticles(BLOG_DIR));

export async function getArticleBySlug(slug) {
  return getAllArticles().find((article) => article.slug === slug) ?? null;
}
