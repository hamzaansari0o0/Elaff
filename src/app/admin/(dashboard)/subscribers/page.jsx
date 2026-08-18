'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/newsletter');
    const data = await res.json();
    setSubscribers(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    if (!confirm('Remove this subscriber?')) return;
    setError('');
    const res = await fetch(`/api/newsletter/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not remove subscriber');
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="font-fraunces text-2xl font-black text-gray-900 mb-6">Newsletter Subscribers</h1>

      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading...</p>
        ) : subscribers.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Email</th>
                <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Subscribed On</th>
                <th className="text-right font-bold text-gray-500 uppercase text-xs px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((s) => (
                <tr key={s._id}>
                  <td className="px-5 py-3 font-semibold text-gray-800">{s.email}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(s._id)}
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
