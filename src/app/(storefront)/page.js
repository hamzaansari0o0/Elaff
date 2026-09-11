import BannerPanels from '@/components/home/BannerPanels';
import MobileBannerCarousel from '@/components/home/MobileBannerCarousel';
import PartnersMarquee from '@/components/home/PartnersMarquee';
import ProductSection from '@/components/home/ProductSection';
import Newsletter from '@/components/home/Newsletter';

import { getProductsByTag, getAllCollections, toCardShape } from '@/lib/products';

// Re-fetch from MongoDB at most once a minute so admin-added products show up
// promptly, while still serving a fast cached page for most visitors.
export const revalidate = 60;

export default async function Home() {
  const [onSale, weeklyFeatured, bestsellers, collections] = await Promise.all([
    getProductsByTag('onSale'),
    getProductsByTag('weeklyFeatured'),
    getProductsByTag('bestseller'),
    getAllCollections(),
  ]);

  const LATEST_ON_SALE = onSale.map(toCardShape);
  const WEEKLY_FEATURED = weeklyFeatured.map(toCardShape);
  const BESTSELLERS = bestsellers.map(toCardShape);

  // Banner panel images — the component renders however many it's given, in order.
  const bannerImages = [
    { src: '/home%20banner%20image/grocery%20products.jpeg', alt: 'Grocery products' },
    { src: '/home%20banner%20image/agricultural%20products.jpeg', alt: 'Agricultural products' },
    { src: '/home%20banner%20image/frozen%20items.jpeg', alt: 'Frozen items' },
    { src: '/home%20banner%20image/confectioneries.jpeg', alt: 'Confectioneries' },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Banner — full-screen scroll-pinned sequence on tablet/desktop; a
          simpler autoplaying carousel on mobile so images fit properly on
          narrow, tall screens. */}
      <div className="hidden sm:block">
        <BannerPanels images={bannerImages} collections={collections} />
      </div>
      <div className="sm:hidden">
        <MobileBannerCarousel images={bannerImages} collections={collections} />
      </div>

      {/* Our Partners */}
      <PartnersMarquee />

      {/* Latest On Sale */}
      <ProductSection title="Latest On Sale" products={LATEST_ON_SALE} link="/shop?tag=onSale" />

      {/* Weekly Featured Products */}
      <ProductSection title="Weekly Featured Products" products={WEEKLY_FEATURED} link="/shop?tag=weeklyFeatured" />

      {/* Our Bestsellers */}
      <ProductSection title="Our Bestsellers" products={BESTSELLERS} link="/shop?tag=bestseller" />

      {/* Newsletter */}
      <Newsletter />
    </main>
  );
}
