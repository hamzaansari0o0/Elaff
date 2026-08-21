import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { CartProvider } from '@/context/CartContext';
import CartBar from '@/components/cart/CartBar';

export default function StorefrontLayout({ children }) {
  return (
    <CartProvider>
      <Header />
      {children}
      <Footer />
      <CartBar />
    </CartProvider>
  );
}
