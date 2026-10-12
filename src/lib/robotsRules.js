// The rules behind /robots.txt, kept apart from app/robots.js so they can be
// tested. (Imports carry a ".js" extension so Node's test runner can load this file.)
import { absoluteUrl, CAN_ADDRESS_PAGES } from './seo.js';

// What no crawler should visit: the admin area and the API.
const PRIVATE_PATHS = ['/admin', '/api'];

// The AI crawlers and AI-training opt-out tokens we explicitly welcome, so that
// ChatGPT, Claude, Perplexity, Gemini and Apple Intelligence can read and
// recommend the site. Search/answer fetchers (OAI-SearchBot, ChatGPT-User,
// Claude-SearchBot, Claude-User, Perplexity-User) fetch pages when a person
// asks; GPTBot, ClaudeBot, PerplexityBot, Bytespider and CCBot gather content
// for models and indexes; Google-Extended and Applebot-Extended are tokens
// that permit Gemini and Apple's AI features to use the content.
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
];

export function buildRobots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: PRIVATE_PATHS },
      // A crawler with a group of its own ignores the "*" group, so every
      // group repeats the private paths.
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: PRIVATE_PATHS })),
    ],
    // A sitemap address on localhost would be useless, so none is named until
    // NEXT_PUBLIC_SITE_URL is set.
    sitemap: CAN_ADDRESS_PAGES ? absoluteUrl('/sitemap.xml') : undefined,
  };
}
