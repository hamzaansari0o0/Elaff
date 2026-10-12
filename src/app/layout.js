import { Fraunces, Bricolage_Grotesque } from 'next/font/google';
import RouteLoadingBar from '@/components/layout/RouteLoadingBar';
import { SITE_URL, SITE_NAME, HOME_TITLE, TITLE_TEMPLATE, SITE_DESCRIPTION, SOCIAL_DEFAULTS } from '@/lib/seo';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

// Site-wide defaults. `metadataBase` turns the relative canonical / share-image
// paths pages declare into full URLs. Pages pass a bare title ("About Us") and
// the template adds the brand; a page with no title (home) gets `default`.
// Each page sets its own canonical and social tags via pageMetadata() in
// lib/seo.js — the social defaults here only cover pages that don't.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: TITLE_TEMPLATE },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  ...SOCIAL_DEFAULTS,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <body className="font-bricolage antialiased bg-slate-50 text-gray-800" suppressHydrationWarning>
        <RouteLoadingBar />
        {children}
      </body>
    </html>
  );
}