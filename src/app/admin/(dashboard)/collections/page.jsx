'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => (prev.size === collections.length ? new Set() : new Set(collections.map((c) => c._id))));
  }

  async function handleBulkDelete() {
    const count = selected.size;
    if (count === 0) return;
    if (!confirm(`Delete ${count} selected collection${count > 1 ? 's' : ''}? This can't be undone.`)) return;

    setBulkDeleting(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not delete selected collections');
      }
      const { deletedCount, blocked } = await res.json();

      if (blocked?.length > 0) {
        const names = blocked.map((b) => `${b.title} (${b.productCount} product${b.productCount > 1 ? 's' : ''})`);
        setNotice(
          `Deleted ${deletedCount} collection${deletedCount !== 1 ? 's' : ''}. Skipped ${blocked.length} still in use: ${names.join(', ')}.`
        );
      }
      setSelected(new Set());
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBulkDeleting(false);
    }
  }

  const allSelected = collections.length > 0 && selected.size === collections.length;

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

      {notice && (
        <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
          {notice}
        </p>
      )}

      {selected.size > 0 && (
        <div className="flex items-center justify-between bg-brand-navy text-white rounded-lg px-4 py-2.5 mb-4">
          <span className="text-xs font-bold">
            {selected.size} collection{selected.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {bulkDeleting ? 'Deleting...' : 'Delete Selected'}
            </button>
          </div>
        </div>
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
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all collections"
                    className="w-4 h-4 accent-brand-navy cursor-pointer"
                  />
                </th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Title</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Slug</th>
                <th className="text-right font-bold text-gray-500 uppercase text-xs px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {collections.map((c) => (
                <tr key={c._id} className={selected.has(c._id) ? 'bg-brand-navy/5' : undefined}>
                  <td className="px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(c._id)}
                      onChange={() => toggleOne(c._id)}
                      aria-label={`Select ${c.title}`}
                      className="w-4 h-4 accent-brand-navy cursor-pointer"
                    />
                  </td>
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
