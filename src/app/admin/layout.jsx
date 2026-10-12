// The admin area is private. robots.txt already asks crawlers to stay out, but
// that only stops well-behaved ones from fetching it. This keeps the pages out
// of search results even if a crawler does fetch one, or the URL is linked from
// somewhere. No markup is added; the pages render exactly as before.
export const metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return children;
}
