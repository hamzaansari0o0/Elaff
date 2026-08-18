'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/collections');
    const data = await res.json();
    setCollections(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this collection?')) return;
    setError('');
    const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Could not delete collection');
      return;
    }
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-fraunces text-2xl font-black text-gray-900">Collections</h1>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 bg-brand-cta hover:bg-brand-cta-hover text-white text-xs font-bold px-4 py-2.5 rounded-lg uppercase tracking-wide transition-colors"
        >
          <Plus className="w-4 h-4" /> New Collection
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
        ) : collections.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No collections yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Title</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Slug</th>
                <th className="text-right font-bold text-gray-500 uppercase text-xs px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collections.map((c) => (
                <tr key={c._id}>
                  <td className="px-5 py-3 font-semibold text-gray-800">{c.title}</td>
                  <td className="px-5 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/collections/${c._id}/edit`}
                        className="p-2 text-gray-500 hover:text-brand-navy hover:bg-slate-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(c._id)}
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
