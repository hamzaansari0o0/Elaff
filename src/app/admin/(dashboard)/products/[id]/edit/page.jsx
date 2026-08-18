import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).populate('collections', 'title slug').lean().catch(() => null);

  if (!product) {
    notFound();
  }

  // Strip Mongoose-specific types (ObjectId, Date) so this plain object can cross to the client component.
  const initialData = JSON.parse(JSON.stringify(product));

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-black text-gray-900 mb-6">Edit Product</h1>
      <ProductForm productId={id} initialData={initialData} />
    </div>
  );
}
