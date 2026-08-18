import ProductDetails from '@/components/product/ProductDetails';

export default function TestProductPage() {
  // Sample Data jo aapke page ko test karega
  const sampleProduct = {
    title: "Premium Corn Gluten Meal",
    sku: "CGM-8001-A",
    category: "Agricultural Products",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80"
    ],
    shortDescription: "High-quality, nutrient-rich corn gluten meal perfect for livestock feed and agricultural applications. Sustainably sourced and processed to maintain maximum protein content.",
    fullDescription: "<p>Our Premium Corn Gluten Meal is a high-protein feed ingredient used widely in poultry, swine, and cattle diets. It provides an excellent source of energy and essential amino acids.</p>",
    specifications: [
      { label: "Protein Content", value: "60% Min" },
      { label: "Moisture", value: "10% Max" },
      { label: "Fiber", value: "2.5% Max" },
      { label: "Packaging", value: "50kg Bags / Bulk Jumbo Bags" }
    ]
  };

  return <ProductDetails product={sampleProduct} />;
}