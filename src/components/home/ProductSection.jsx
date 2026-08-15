import SectionHeader from '@/components/ui/SectionHeader';
import ProductCard from '@/components/ui/ProductCard';

export default function ProductSection({ title, products, link }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <SectionHeader title={title} link={link} />
      {/* Responsive Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-4 md:mt-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}