'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2, Mail, Phone, Search } from 'lucide-react';

const STATUS_STYLES = {
  new: 'bg-amber-50 text-brand-amber',
  read: 'bg-blue-50 text-blue-600',
  closed: 'bg-gray-100 text-gray-500',
};

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'closed', label: 'Closed' },
];

function matchesSearch(msg, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    msg.name.toLowerCase().includes(q) ||
    msg.email.toLowerCase().includes(q) ||
    msg.message.toLowerCase().includes(q)
  );
}

function StatusSelect({ message, onChange }) {
  return (
    <select
      value={message.status}
      onChange={(e) => onChange(message._id, e.target.value)}
      className={`text-xs font-bold uppercase px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer ${STATUS_STYLES[message.status]}`}
    >
      <option value="new">New</option>
      <option value="read">Read</option>
      <option value="closed">Closed</option>
    </select>
  );
}

export default function AdminContactMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const res = await fetch('/api/contact');
    const data = await res.json();
    setMessages(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, same pattern as the Inquiries admin page
    load();
  }, []);

  async function handleStatusChange(id, status) {
    setError('');
    setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, status } : m)));
    const res = await fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError('Could not update status');
      load();
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this message?')) return;
    setError('');
    const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      setError('Could not delete message');
      return;
    }
    load();
  }

  const counts = useMemo(
    () => ({
      all: messages.length,
      new: messages.filter((m) => m.status === 'new').length,
      read: messages.filter((m) => m.status === 'read').length,
      closed: messages.filter((m) => m.status === 'closed').length,
    }),
    [messages]
  );

  const filtered = useMemo(
    () =>
      messages.filter(
        (m) => (statusFilter === 'all' || m.status === statusFilter) && matchesSearch(m, search)
      ),
    [messages, statusFilter, search]
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-fraunces text-2xl font-black text-gray-900">Contact Messages</h1>
        {counts.new > 0 && (
          <span className="bg-brand-amber text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {counts.new} New
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${
                statusFilter === tab.value ? 'bg-brand-navy text-white' : 'text-gray-500 hover:bg-slate-50'
              }`}
            >
              {tab.label} <span className="opacity-70">({counts[tab.value]})</span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, message..."
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-brand-navy bg-white"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-500">
          {messages.length === 0 ? 'No contact messages yet.' : 'No messages match this filter.'}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Sender</th>
                    <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Message</th>
                    <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Date</th>
                    <th className="text-left font-bold text-gray-500 uppercase text-xs px-5 py-3">Status</th>
                    <th className="text-right font-bold text-gray-500 uppercase text-xs px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((m) => (
                    <tr key={m._id} className="align-top">
                      <td className="px-5 py-3">
                        <p className="font-semibold text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.email}</p>
                        {m.phone && <p className="text-xs text-gray-400">{m.phone}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs max-w-md leading-relaxed">{m.message}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <StatusSelect message={m} onChange={handleStatusChange} />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end items-center gap-1">
                          <a
                            href={`mailto:${m.email}`}
                            className="p-2 text-gray-500 hover:text-brand-navy hover:bg-slate-50 rounded-lg transition-colors"
                            aria-label={`Email ${m.name}`}
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(m._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete message"
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
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((m) => (
              <div key={m._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{m.name}</p>
                    <p className="text-xs text-gray-500 truncate">{m.email}</p>
                    {m.phone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {m.phone}
                      </p>
                    )}
                  </div>
                  <StatusSelect message={m} onChange={handleStatusChange} />
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{m.message}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[11px] text-gray-400">{new Date(m.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center gap-1">
                    <a
                      href={`mailto:${m.email}`}
                      className="p-2 text-gray-500 hover:text-brand-navy hover:bg-slate-50 rounded-lg transition-colors"
                      aria-label={`Email ${m.name}`}
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Delete message"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
