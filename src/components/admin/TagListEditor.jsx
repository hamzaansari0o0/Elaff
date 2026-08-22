'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export default function TagListEditor({ label, placeholder, values, onChange }) {
  const [draft, setDraft] = useState('');

  function addTag() {
    const value = draft.trim();
    if (!value) return;
    onChange([...values, value]);
    setDraft('');
  }

  function removeTag(idx) {
    onChange(values.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((tag, idx) => (
          <span
            key={idx}
            className="flex items-center gap-1.5 bg-slate-100 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg"
          >
            {tag}
            <button type="button" onClick={() => removeTag(idx)} className="text-gray-400 hover:text-red-600">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
        />
        <button
          type="button"
          onClick={addTag}
          className="flex items-center gap-1 text-xs font-bold text-brand-navy border border-gray-300 hover:border-brand-navy rounded-lg px-3 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
