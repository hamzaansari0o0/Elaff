import { MotionConfig } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import Chatbot from '@/components/chatbot/Chatbot';
import SmoothScroll from '@/components/layout/SmoothScroll';
import { getCompanySettings } from '@/lib/settings';
import { getAllCollections } from '@/lib/products';

// Applies to every page under this layout — without it, pages that don't set their
// own revalidate (shop, product, collection) render fully static, so admin edits to
// CompanySettings (WhatsApp number, phone, etc.) never show up until the next deploy.
export const revalidate = 60;

export default async function StorefrontLayout({ children }) {
  const [companySettings, collections] = await Promise.all([getCompanySettings(), getAllCollections()]);

  return (
    <CartProvider>
      {/* Makes every framer-motion component under the storefront respect the
          OS-level "reduce motion" setting automatically (transform-based
          animations skip; opacity fades still play), without threading a
          check through each component individually. */}
      <MotionConfig reducedMotion="user">
        {/* Lenis momentum scroll — every storefront page, not just the home page.
            Scoped to this layout only, so /admin keeps native scroll. */}
        <SmoothScroll>
          <Header companySettings={companySettings} collections={collections} />
          {children}
          <Footer />
        </SmoothScroll>

        {/* AI Chatbot + WhatsApp widget — every storefront page, not just the home page */}
        <Chatbot whatsappNumber={companySettings.whatsapp} />
      </MotionConfig>
    </CartProvider>
  );
}
