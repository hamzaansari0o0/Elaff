import Header from '@/components/layout/Header';
import HeroSlider from '@/components/home/HeroSlider';
import ProductSection from '@/components/home/ProductSection';
import Newsletter from '@/components/home/Newsletter';
import CategoryCards from '@/components/home/CategoryCards';
import FooterMiniLists from '@/components/home/FooterMiniLists';
import Footer from '@/components/layout/Footer';

import { LATEST_ON_SALE, WEEKLY_FEATURED, BESTSELLERS } from '@/data/mockData';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      {/* Hero Banner Slider */}
      <HeroSlider />

      {/* Latest On Sale */}
      <ProductSection title="Latest On Sale" products={LATEST_ON_SALE} />

      {/* Weekly Featured Products */}
      <ProductSection title="Weekly Featured Products" products={WEEKLY_FEATURED} />

      {/* Our Bestsellers */}
      <ProductSection title="Our Bestsellers" products={BESTSELLERS} />

      {/* Newsletter */}
      <Newsletter />

      {/* Circular Category Cards */}
      <CategoryCards />

      {/* 4-Column Mini Product Grids */}
      <FooterMiniLists />

      {/* Footer */}
      <Footer />
    </main>
  );
}