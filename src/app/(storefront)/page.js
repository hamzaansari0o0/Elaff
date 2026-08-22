import HeroSlider from '@/components/home/HeroSlider';
import ProductSection from '@/components/home/ProductSection';
import Newsletter from '@/components/home/Newsletter';
import CategoryCards from '@/components/home/CategoryCards';
import FooterMiniLists from '@/components/home/FooterMiniLists';
import Chatbot from '@/components/chatbot/Chatbot';

import { getProductsByTag, toCardShape } from '@/lib/products';

// Re-fetch from MongoDB at most once a minute so admin-added products show up
// promptly, while still serving a fast cached page for most visitors.
export const revalidate = 60;

export default async function Home() {
  const [onSale, weeklyFeatured, bestsellers] = await Promise.all([
    getProductsByTag('onSale'),
    getProductsByTag('weeklyFeatured'),
    getProductsByTag('bestseller'),
  ]);

  const LATEST_ON_SALE = onSale.map(toCardShape);
  const WEEKLY_FEATURED = weeklyFeatured.map(toCardShape);
  const BESTSELLERS = bestsellers.map(toCardShape);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Latest On Sale */}
      <ProductSection title="Latest On Sale" products={LATEST_ON_SALE} link="/shop?tag=onSale" />

      {/* Weekly Featured Products */}
      <ProductSection title="Weekly Featured Products" products={WEEKLY_FEATURED} link="/shop?tag=weeklyFeatured" />

      {/* Our Bestsellers */}
      <ProductSection title="Our Bestsellers" products={BESTSELLERS} link="/shop?tag=bestseller" />

      {/* Newsletter */}
      <Newsletter />

      {/* Circular Category Cards */}
      <CategoryCards />

      {/* 4-Column Mini Product Grids */}
      <FooterMiniLists />

      {/* AI Chatbot Widget */}
      <Chatbot />
    </main>
  );
}
