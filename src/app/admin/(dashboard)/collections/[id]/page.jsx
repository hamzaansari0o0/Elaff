import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/models/Collection';
import Product from '@/models/Product';
import CollectionProductsTable from '@/components/admin/CollectionProductsTable';

function serialize(doc) {
  return JSON.parse(JSON.stringify(doc));
}

export default async function CollectionProductsPage({ params }) {
  const { id } = await params;
  await connectDB();

  const collection = await Collection.findById(id).lean().catch(() => null);
  if (!collection) {
    notFound();
  }

  const products = await Product.find({ collections: id })
    .populate('collections', 'title slug')
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div>
      <Link
        href="/admin/collections"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-navy transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Collections
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-fraunces text-2xl font-black text-gray-900">{collection.title}</h1>
          <p className="text-xs text-gray-400 font-mono mt-1">{collection.slug}</p>
        </div>
      </div>

      <CollectionProductsTable collectionId={id} initialProducts={serialize(products)} />
    </div>
  );
}
