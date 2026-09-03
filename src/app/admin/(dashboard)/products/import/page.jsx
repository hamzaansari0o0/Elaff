import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductImportForm from '@/components/admin/ProductImportForm';

export default function ImportProductsPage() {
  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-brand-navy uppercase tracking-wide mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
      </Link>
      <h1 className="font-fraunces text-2xl font-black text-gray-900 mb-6">Import Products from CSV</h1>
      <ProductImportForm />
    </div>
  );
}
