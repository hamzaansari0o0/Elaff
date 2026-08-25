import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import Chatbot from '@/components/chatbot/Chatbot';
import { getCompanySettings } from '@/lib/settings';

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
