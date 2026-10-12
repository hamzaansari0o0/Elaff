import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import nextConfigModule from 'next/dist/server/config.js';
import { shouldServeStreamingMetadata } from 'next/dist/server/lib/streaming-metadata.js';

// Load next.config.mjs the way the Next server does (it turns the RegExp setting
// into a string), then ask Next's own function what it would do per visitor.
const projectRoot = fileURLToPath(new URL('../../', import.meta.url));
const config = await nextConfigModule.default('phase-production-server', projectRoot);

// User-agent strings as these crawlers publish them.
const CRAWLERS = {
  GPTBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.1; +https://openai.com/gptbot)',
  'OAI-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
  'ChatGPT-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
  ClaudeBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
  'Claude-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
  'Claude-SearchBot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Claude-SearchBot/1.0; +Claude-SearchBot@anthropic.com)',
  PerplexityBot: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
  'Perplexity-User': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)',
  Bytespider: 'Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)',
  CCBot: 'CCBot/2.0 (https://commoncrawl.org/faq/)',
  Amazonbot: 'Mozilla/5.0 AppleWebKit/600.2.5 (KHTML, like Gecko) Version/8.0.2 Safari/600.2.5 (Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)',
  'meta-externalagent': 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  Googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  Bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
  'a crawler that does not exist yet': 'FutureAIBot/9.9 (+https://example.com/bot)',
};

test('every crawler gets its title, canonical and robots tags inside <head>, never streamed into <body>', () => {
  for (const [name, userAgent] of Object.entries(CRAWLERS)) {
    assert.equal(
      shouldServeStreamingMetadata(userAgent, config.htmlLimitedBots),
      false,
      `${name} would get its page metadata appended to <body> whenever it arrives after the page — a crawler that does not run JavaScript would miss a noindex or canonical there`
    );
  }
});
