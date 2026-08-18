'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/products');
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this product?')) return;
    setError('');
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Could not delete product');
      return;
    }
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-fraunces text-2xl font-black text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" /> New Product
        </Link>
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : products.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No products yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Product</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Collections</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Status</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Price</th>
                <th className="text-right font-bold text-gray-500 uppercase text-xs px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.images?.[0] && (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">{p.title}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {p.collections?.map((c) => c.title).join(', ') || '—'}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                        p.status === 'active' ? 'bg-brand-green/10 text-brand-green' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-700 font-semibold">
                    {p.price != null ? `$${p.price}${p.priceUnit || ''}` : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${p._id}/edit`}
                        className="p-2 text-gray-500 hover:text-brand-navy hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
