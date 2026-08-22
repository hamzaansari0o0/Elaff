'use client';

import { Plus, Trash2 } from 'lucide-react';

export default function KeyValueListEditor({ rows, onChange, labelPlaceholder = 'Label', valuePlaceholder = 'Value' }) {
  function addRow() {
    onChange([...rows, { label: '', value: '' }]);
  }

  function updateRow(idx, field, value) {
    onChange(rows.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  }

  function removeRow(idx) {
    onChange(rows.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400">No rows added yet.</p>
      ) : (
        rows.map((row, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              type="text"
              value={row.label}
              onChange={(e) => updateRow(idx, 'label', e.target.value)}
              placeholder={labelPlaceholder}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
            <input
              type="text"
              value={row.value}
              onChange={(e) => updateRow(idx, 'value', e.target.value)}
              placeholder={valuePlaceholder}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
            />
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Add Row
      </button>
    </div>
  );
}
