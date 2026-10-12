/** @type {import('next').NextConfig} */
const nextConfig = {
  // When a page's metadata (title, canonical, robots, ...) arrives after the
  // page itself, Next appends it to <body> instead of <head> — except for the
  // short list of crawlers it knows, which does not include GPTBot, ClaudeBot,
  // PerplexityBot or any AI crawler that appears later. Crawlers that don't run
  // JavaScript look in <head>, so they would miss a late `noindex` or canonical.
  // Every page here waits for its data before it is sent anyway, so streaming
  // the metadata gains nothing; matching every visitor means it always lands in <head>.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
