'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

const STATUS_STYLES = {
  new: 'bg-amber-50 text-brand-amber',
  contacted: 'bg-blue-50 text-blue-600',
  closed: 'bg-gray-100 text-gray-500',
};

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/inquiries');
    const data = await res.json();
    setInquiries(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStatusChange(id, status) {
    setError('');
    const res = await fetch(`/api/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError('Could not update status');
      return;
    }
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this inquiry?')) return;
    setError('');
    const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not delete inquiry');
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-black text-gray-900 mb-6">Inquiries</h1>

      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : inquiries.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No inquiries yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Customer</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Products</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Message</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Date</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Status</th>
                <th className="text-right font-bold text-gray-500 uppercase text-xs px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inquiries.map((inq) => (
                <tr key={inq._id} className="align-top">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-gray-800">{inq.name}</p>
                    <p className="text-xs text-gray-500">{inq.email}</p>
                    {inq.phone && <p className="text-xs text-gray-400">{inq.phone}</p>}
                  </td>
                  <td className="px-5 py-3 space-y-1">
                    {(inq.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        {item.productSlug ? (
                          <Link
                            href={`/product/${item.productSlug}`}
                            target="_blank"
                            className="font-semibold text-brand-navy hover:underline"
                          >
                            {item.productTitle}
                          </Link>
                        ) : (
                          <span className="font-semibold text-gray-700">{item.productTitle}</span>
                        )}
                        <span className="text-gray-400">×</span>
                        <span className="text-gray-600">{item.quantity}</span>
                      </div>
                    ))}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs max-w-xs">
                    {inq.message || '—'}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                      className={`text-xs font-bold uppercase px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${STATUS_STYLES[inq.status]}`}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(inq._id)}
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
