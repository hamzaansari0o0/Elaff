import { buildRobots } from '@/lib/robotsRules';

// The rules (and the sitemap line, which needs NEXT_PUBLIC_SITE_URL) live in lib/robotsRules.js.
export default function robots() {
  return buildRobots();
}
