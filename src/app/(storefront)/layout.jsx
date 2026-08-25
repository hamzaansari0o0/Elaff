import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import Chatbot from '@/components/chatbot/Chatbot';
import { getCompanySettings } from '@/lib/settings';

// Applies to every page under this layout — without it, pages that don't set their
// own revalidate (shop, product, collection) render fully static, so admin edits to
// CompanySettings (WhatsApp number, phone, etc.) never show up until the next deploy.
export const revalidate = 60;

export default async function StorefrontLayout({ children }) {
  const companySettings = await getCompanySettings();

  return (
    <CartProvider>
      <Header />
      {children}
      <Footer />

      {/* AI Chatbot + WhatsApp widget — every storefront page, not just the home page */}
      <Chatbot whatsappNumber={companySettings.whatsapp} />
    </CartProvider>
  );
}
