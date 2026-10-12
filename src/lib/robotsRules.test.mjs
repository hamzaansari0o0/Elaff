import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import nextRouteData from 'next/dist/build/webpack/loaders/metadata/resolve-route-data.js';

// seo.js reads the site URL when first imported, so set it before importing.
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.example.com';
const { buildRobots } = await import('./robotsRules.js');

describe('robots.txt rules', () => {
  test('keeps every crawler out of the admin area and the API', () => {
    const text = nextRouteData.resolveRouteData(buildRobots(), 'robots');
    assert.match(text, /^User-Agent: \*$/m);
    assert.match(text, /^Allow: \/$/m);
    assert.match(text, /^Disallow: \/admin$/m);
    assert.match(text, /^Disallow: \/api$/m);
  });

  // Parses robots.txt text into groups: { agents, allow, disallow }.
  const groupsOf = (text) =>
    text.trim().split(/\n\s*\n/).filter((block) => /^User-Agent:/im.test(block)).map((block) => {
      const lines = block.split('\n');
      const pick = (name) => lines.filter((l) => l.toLowerCase().startsWith(`${name}:`)).map((l) => l.split(':').slice(1).join(':').trim());
      return { agents: pick('user-agent'), allow: pick('allow'), disallow: pick('disallow') };
    });

  const AI_CRAWLERS = [
    'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
    'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bytespider', 'CCBot',
  ];

  test('every AI crawler is explicitly allowed in its own group', () => {
    const groups = groupsOf(nextRouteData.resolveRouteData(buildRobots(), 'robots'));
    for (const bot of AI_CRAWLERS) {
      const group = groups.find((g) => g.agents.includes(bot));
      assert.ok(group, `${bot} has no group of its own`);
      assert.deepEqual(group.allow, ['/'], `${bot} is not explicitly allowed`);
    }
  });

  test('each AI crawler group repeats the admin and API blocks, because a crawler with its own group ignores the "*" group', () => {
    const groups = groupsOf(nextRouteData.resolveRouteData(buildRobots(), 'robots'));
    for (const bot of AI_CRAWLERS) {
      const group = groups.find((g) => g.agents.includes(bot));
      assert.deepEqual(group.disallow, ['/admin', '/api'], bot);
    }
  });

  test('the general group for all other crawlers is still there', () => {
    const groups = groupsOf(nextRouteData.resolveRouteData(buildRobots(), 'robots'));
    const general = groups.find((g) => g.agents.includes('*'));
    assert.deepEqual(general.disallow, ['/admin', '/api']);
  });

  test('names the sitemap on the real site URL', () => {
    const text = nextRouteData.resolveRouteData(buildRobots(), 'robots');
    assert.match(text, /^Sitemap: https:\/\/www\.example\.com\/sitemap\.xml$/m);
  });

  test('a production build with no site URL names no sitemap rather than a localhost one', () => {
    const dir = fileURLToPath(new URL('.', import.meta.url));
    const run = (siteUrl) => {
      const env = { ...process.env, NODE_ENV: 'production' };
      delete env.NEXT_PUBLIC_SITE_URL;
      if (siteUrl) env.NEXT_PUBLIC_SITE_URL = siteUrl;
      const code = `
        const { buildRobots } = await import('./robotsRules.js');
        console.log(JSON.stringify(buildRobots().sitemap ?? null));
      `;
      const result = spawnSync(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', '--input-type=module', '-e', code], {
        cwd: dir,
        env,
        encoding: 'utf8',
      });
      assert.equal(result.status, 0, result.stderr);
      return JSON.parse(result.stdout.trim());
    };

    assert.equal(run(undefined), null);
    assert.equal(run('https://www.example.com'), 'https://www.example.com/sitemap.xml');
  });
});
