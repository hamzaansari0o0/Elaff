# Blog (SEO / AEO / GEO articles) — Design

Date: 2026-10-12
Status: design approved in chat; built and published on 2026-10-12 (see "As built" at the end).

## Goal

Bring bulk buyers (importers, wholesalers, distributors) to https://elafftradingco.com through informational search and AI answers, and move them to the inquiry form. The site has no blog today. This adds a small blog section and ten articles (about 10,000 words in total), each aimed at one buyer question and its keywords.

Success looks like:

- Ten articles live at `/blog/<slug>`, listed at `/blog`, in the sitemap, and readable by crawlers without JavaScript.
- Each article answers one buyer question near the top, has a visible FAQ with matching FAQPage data, and links to the relevant collection and product pages and to the inquiry form.
- Nothing in the articles is invented: company facts come only from what the site already states.

## Decisions taken with the owner

- "10,000" means 10,000 **words in total**: 10 articles of roughly 1,000 words. (10,000 separate posts was rejected: bulk-produced pages risk Google's scaled-content spam policy for the whole site.)
- Articles are **markdown files in the repository** (`content/blog/*.md`). No admin editor, no database model. New articles are added by a commit; Vercel redeploys.
- Language: English. Author and publisher: the organization, Elaff Trade Co. No invented person names.
- The owner reads every article before anything is pushed.

## Non-goals

Admin editor, images or illustrations inside articles, comments, categories or tags, RSS, pagination (ten posts), site search, table of contents, `llms.txt` (skipped earlier), social profile links (`sameAs`).

## Architecture

### Content files

`content/blog/<slug>.md`, one per article. A flat front matter block, then the body:

```
---
title: Frozen Chicken Leg Quarter Wholesale: A Buyer's Guide
description: One or two sentences for the search result (70-155 characters).
keyword: frozen chicken leg quarter wholesale
keywords: halal frozen chicken supplier, bulk frozen chicken
date: 2026-10-12
updated: 2026-10-12
order: 1
collections: meat-poultry, frozen-foods
products: frozen-chicken-leg-quarter
---
Lead paragraph: the direct answer, 30-50 words.

## Section heading
...

## Frequently asked questions

### Question one?
Answer.
```

- `order` (optional, whole number from 1) decides the listing order of articles published on the same day; lower comes first, articles without one come last.
- `collections` and `products` are slugs used for internal links and for the "Related products" block. A slug that no longer exists is skipped quietly at render time, never an error.
- The body's first paragraph is the **lead answer**: it is styled as a lead and is what AI engines will quote.
- The `## Frequently asked questions` section is cut out of the body and parsed into `{ question, answer }` items. The page shows them with the existing `FaqSection` (native `<details>` plus FAQPage JSON-LD built from the same items).
- Line endings: files may be CRLF (Windows, `core.autocrlf=true`). The parser normalizes them.

### Modules

| File | Purpose |
|---|---|
| `src/lib/blogParse.js` | Pure functions, no `fs`: `parseFrontMatter`, `splitFaq`, `renderMarkdown` (uses `marked`), `leadParagraph`, `wordCount`, `readingMinutes`, and `parseArticle(source, filename)`, which validates required fields and throws a clear error naming the file (a broken article fails the build rather than shipping). |
| `src/lib/blog.js` | Reads `content/blog` with `fs`; `getAllArticles()` (newest first) and `getArticleBySlug(slug)`; wrapped in React `cache()` like `getProductBySlug`. |
| `src/lib/seo.js` (extended) | `articleLd(article)`, `blogLd(articles)`; `pageMetadata` gets an optional `article: { publishedTime, modifiedTime }` that sets `og:type=article`. |
| `src/lib/breadcrumbs.js` (extended) | `articleBreadcrumbs(article)` = Home > Blog > article; `blogBreadcrumbs()` = Home > Blog. |
| `src/lib/sitemapEntries.js` (extended) | `/blog` fixed entry; one entry per article (`lastModified` = its `updated` date; monthly; priority 0.7). `buildSitemapEntries` takes `articles`. `app/sitemap.js` passes `getAllArticles()`. |
| `src/app/(storefront)/blog/page.jsx` | The list. |
| `src/app/(storefront)/blog/[slug]/page.jsx` | One article. |
| `src/components/blog/` | `BlogCard` (list item) and `ArticleCta` (inquiry call to action plus collection links). Related products reuse the existing `ProductCard`. |
| `src/app/globals.css` | A `.blog-prose` block styling article HTML (headings, lists, tables, links, blockquote). The project has no typography plugin, so this stays local and small. |
| `Navbar.jsx`, `Footer.jsx` | A "Blog" link (desktop nav, mobile menu, footer). |
| `next.config.mjs` | `outputFileTracingIncludes` for `/blog` and `/blog/*` so `content/blog/**` is in the Vercel function bundle (needed because pages revalidate at runtime). |
| `package.json` | Adds `marked` (version pinned at install). Nothing else. |

### Page behaviour

**`/blog`**: title "Wholesale Food Import & Sourcing Guides" (the layout adds the brand), a short intro, cards newest first (title, description, date, reading time). JSON-LD: `Blog` node listing its posts plus `BreadcrumbList`. Canonical `/blog`.

**`/blog/[slug]`**:

- `generateStaticParams` from the files; `dynamicParams = false` (unknown slug = 404). The storefront layout already sets `revalidate = 60`, so Related products stay fresh without a page-level setting.
- Metadata through `pageMetadata({ title, description, path, article })`.
- Layout: breadcrumb, one `h1`, a meta line (published, updated, reading time, "By Elaff Trade Co."), the lead paragraph, the body, the FAQ section, "Related products" (up to 4 from `products`, active products only; `getProductBySlug` does not filter by status, so the page must), links to the listed collections, and a closing inquiry call to action to `/contact`.
- JSON-LD: `BlogPosting` (headline, description, datePublished, dateModified, `author` and `publisher` as inline Organization nodes with `@id`, name and url, because Google's Article checks look for a name and a separate script tag's `@id` may not be joined; image = default share image; keywords; wordCount; `mainEntityOfPage`), `BreadcrumbList` built from the same trail as the visible breadcrumb, and FAQPage via `FaqSection`.
- Under the FAQ, a "More guides" row links to the next two articles in the list (wrapping around), so every article links on to others.
- Articles are written once per deploy; drafts are not a feature (nothing is pushed until the owner approves).

## Content rules

1. Company facts only from what the site already says: MOQ as low as one pallet; ships in 24-72 hours, 7-day express by air freight; EXW, FOB or CNF; Halal and HACCP certification support; delivery to the Gulf, UK, USA and South Africa; sourcing worldwide. No made-up prices, certificates, customer names, statistics, awards or years in business.
2. Product facts (sizes, packaging, MOQ, specs) come from the live product pages at writing time.
3. General industry knowledge only where widely established (for example frozen storage at -18 C). Every figure, standard name and regulation is listed for the owner's check in the hand-over message.
4. Each article: lead answer (30-50 words); 5-7 `##` sections; at least one list or table; 4-5 FAQ items; body 850-1,150 words (FAQ included); at least two internal links to collection or product pages, one to `/contact`, and one or two to sibling articles; a natural, not repeated, use of the main keyword in the title, lead, one heading and the closing.
5. Overlap control: product articles (1-5) are about the product; process articles (6-10) are about how to buy and ship. Each has its own primary keyword.

## The ten articles

| # | Slug | Article | Primary keyword | Collections |
|---|---|---|---|---|
| 1 | frozen-chicken-leg-quarter-wholesale-guide | Frozen Chicken Leg Quarter Wholesale: A Buyer's Guide | frozen chicken leg quarter wholesale | meat-poultry, frozen-foods |
| 2 | frozen-mango-pulp-wholesale | Frozen Mango Pulp Wholesale: Specs, Packing and Uses | frozen mango pulp wholesale | frozen-foods, fresh-fruits |
| 3 | frozen-strawberry-wholesale | Frozen Strawberry Wholesale: What Importers Should Know | frozen strawberry wholesale | frozen-foods |
| 4 | wholesale-mozzarella-shredded-vs-block | Frozen Mozzarella: Shredded vs Block for Bulk Buyers | wholesale mozzarella cheese | frozen-foods |
| 5 | buying-fresh-fruit-in-bulk | Buying Fresh Fruit in Bulk: Fuji Apples, Red Grapes, Pomegranates, Mandarins | wholesale fresh fruit supplier | fresh-fruits |
| 6 | ship-frozen-food-internationally | How to Ship Frozen Food Internationally: Cold Chain and Reefer Containers | frozen food shipping | frozen-foods, meat-poultry |
| 7 | exw-vs-fob-vs-cnf | EXW vs FOB vs CNF: Which Trade Term Should an Importer Choose? | EXW vs FOB vs CNF | food-beverages |
| 8 | halal-haccp-certification-importers | Halal and HACCP Certification: What Importers Should Check | halal certified food supplier | meat-poultry, food-beverages |
| 9 | import-food-from-one-pallet | Starting Small: Importing Food from One Pallet | wholesale food minimum order | food-beverages |
| 10 | choose-reliable-wholesale-food-supplier | How to Choose a Reliable Wholesale Food Supplier: A Checklist | reliable wholesale food supplier | food-beverages |

Collection slugs above exist on the live site today (checked in the sitemap). Product slugs are filled in when each article is written, from the live catalog.

## Testing and verification

Unit tests (`npm test`, the existing `node:test` runner):

- `blogParse`: front matter (CRLF and LF, quotes, missing or duplicate keys, bad dates), FAQ split (no FAQ, several, extra text), lead extraction, word and reading time, Markdown (lists, tables, links), error messages naming the file.
- `blogContent` (runs over the real `content/blog`): every article parses; slugs unique and equal to filenames; description 70-155 characters; lead 30-55 words; body 850-1,150 words and total 9,500-10,500; at least four FAQ items; internal links only to `/contact`, `/shop`, `/about`, `/collection/<known slug>`, `/product/<slug>`, `/blog/<existing article>`; sibling links resolve; no raw `<script>`, placeholder text or empty headings; `updated` not before `date`, neither in the future.
- `seo`: `articleLd` and `blogLd` shapes, blank-field removal, escaping; `pageMetadata` `article` option; `sitemapEntries`: `/blog` and articles present with the right dates, none when the site URL is missing.
- Mutation checks on the new modules, as for earlier steps.

End-to-end (production build with `NEXT_PUBLIC_SITE_URL` set, then `next start`):

- `/blog` and all ten articles return 200; unknown `/blog/x` returns 404.
- Each article: one `h1`, canonical, `og:type=article`, title and description in `<head>` for a normal browser and for GPTBot, ClaudeBot and PerplexityBot user agents; JSON-LD parses and contains Article, BreadcrumbList and FAQPage; FAQ text in JSON-LD equals the visible text; breadcrumb names match.
- Sitemap lists `/blog` and the ten articles; robots.txt unchanged.
- `.next/server/app/blog/[slug].nft.json` includes `content/blog` files (proves they ship to Vercel's function).
- Headless-Chrome screenshots of `/blog` and one article at desktop and phone width; no horizontal scroll.
- `npm run lint` clean for the new files (the repo already has unrelated lint errors).

## Risks

- **Content accuracy** (the main one). Mitigated by rule 1-3, by listing every checkable claim in the hand-over, and by the owner's review before any push.
- **File access on Vercel**: reading `content/` at runtime can fail if the files are not traced into the function. Mitigated by `outputFileTracingIncludes` and the `.nft.json` check; the first production deploy is checked live.
- **Slow results**: ten articles do not rank at once; Google needs weeks to months. The hand-over says so.
- **Existing uncommitted work**: `ProductProfileTabs.jsx` and `price_backup_before_clear.json` stay out of every commit.
- **Next.js 16 differences**: before coding, re-read the relevant guides in `node_modules/next/dist/docs/` (`generateStaticParams`, metadata, sitemap, route segment config) as `AGENTS.md` requires.

## Order of work (to be detailed in the implementation plan)

1. Parser and tests; `seo.js`, breadcrumbs and sitemap extensions with tests.
2. Pages, components, CSS, navigation, `next.config.mjs`, with a placeholder article to see it render.
3. Write the ten articles (each from the live product data), run the content tests.
4. Production build and the end-to-end checks above.
5. Owner reviews the articles; only then commit and push.

## As built (2026-10-12)

- Added beyond the first draft: the `order` front matter field, the "More guides" row, `formatDate` (dates always read in UTC), and table wrapping (`.blog-table`) so wide tables scroll inside their own box on phones.
- `Article` became `BlogPosting` in the structured data, which is the schema.org type for blog posts and a subtype of Article.
- Page-level `revalidate` was dropped: the storefront layout's 60 seconds already applies to the blog.
- Tests: `blogParse`, `blog` (loader and ordering), `blogContent` (the real articles), plus new cases in `seo`, `breadcrumbs` and `sitemapEntries`. A mutation check over the new modules caught 87 of 87 planted bugs.
- Launch set: ten articles, about 9,700 words in total, in `content/blog`.
