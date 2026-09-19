'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, X } from 'lucide-react';

// Unassigns a product from this collection only — the product itself is
// never deleted, matching Shopify's "remove from collection" behavior.
export default function CollectionProductsTable({ collectionId, initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState('');

  async function handleRemove(product) {
    if (!confirm(`Remove "${product.title}" from this collection?`)) return;

    setRemovingId(product._id);
    setError('');
    try {
      const remainingCollections = product.collections
        .filter((c) => c._id !== collectionId)
        .map((c) => c._id);

      const res = await fetch(`/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collections: remainingCollections }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not remove product from collection');
      }

      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No products in this collection.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Product</th>
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
                          onClick={() => handleRemove(p)}
                          disabled={removingId === p._id}
                          title="Remove from collection"
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-60"
                        >
                          <X className="w-4 h-4" />
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
