import { jsonLdHtml } from '@/lib/seo';

// Renders schema.org structured data into the page's server-rendered HTML,
// where crawlers (including AI bots that don't run JavaScript) can read it.
// Pass one node or an array of nodes built with the helpers in lib/seo.js; they
// are emitted together as a single graph. A plain <script> is correct here —
// next/script is for executable code, and this is data.
export default function JsonLd({ nodes }) {
  const html = jsonLdHtml(nodes);
  if (!html) return null;

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />;
}
