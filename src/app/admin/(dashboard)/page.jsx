import Link from 'next/link';
import { Package, FolderTree, Mail, Plus } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Collection from '@/models/Collection';
import Inquiry from '@/models/Inquiry';

export default async function AdminDashboardPage() {
  await connectDB();
  const [productCount, collectionCount, newInquiryCount] = await Promise.all([
    Product.countDocuments(),
    Collection.countDocuments(),
    Inquiry.countDocuments({ status: 'new' }),
  ]);

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-black text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <Package className="w-6 h-6 text-brand-amber" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{productCount}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Products</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <FolderTree className="w-6 h-6 text-brand-amber" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{collectionCount}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Collections</p>
          </div>
        </div>

        <Link
          href="/admin/inquiries"
          className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 hover:border-brand-navy transition-colors"
        >
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
            <Mail className="w-6 h-6 text-brand-amber" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{newInquiryCount}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">New Inquiries</p>
          </div>
        </Link>
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" /> New Product
        </Link>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-brand-navy hover:text-brand-navy text-gray-700 text-xs font-bold px-4 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" /> New Collection
        </Link>
      </div>
    </div>
  );
}
