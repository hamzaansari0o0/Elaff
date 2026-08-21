'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, Table2, AlignLeft, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

const SECTION_TYPES = [
  {
    type: 'infoTable',
    label: 'Info Table',
    hint: 'Label / value rows — e.g. Basic Information, Trading Capabilities, Factory Details',
    icon: Table2,
  },
  {
    type: 'richText',
    label: 'Rich Text',
    hint: 'A heading + paragraph — e.g. Site Advantages, Company Story',
    icon: AlignLeft,
  },
  {
    type: 'imageText',
    label: 'Image + Text',
    hint: 'One image beside a description — e.g. Production Capacity, Quality Control',
    icon: ImageIcon,
  },
  {
    type: 'gallery',
    label: 'Image Gallery',
    hint: 'A grid of images — e.g. Factory Photos, Certifications',
    icon: LayoutGrid,
  },
];

const TYPE_META = Object.fromEntries(SECTION_TYPES.map((t) => [t.type, t]));

function createSection(type) {
  switch (type) {
    case 'infoTable':
      return { type, title: '', fields: [{ label: '', value: '' }] };
    case 'richText':
      return { type, title: '', body: '' };
    case 'imageText':
      return { type, title: '', image: '', body: '' };
    case 'gallery':
      return { type, title: '', images: [] };
    default:
      return { type, title: '' };
  }
}

export default function PageSectionsBuilder({ sections, onChange }) {
  function addSection(type) {
    onChange([...sections, createSection(type)]);
  }

  function updateSection(idx, patch) {
    onChange(sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function removeSection(idx) {
    onChange(sections.filter((_, i) => i !== idx));
  }

  function moveSection(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function addFieldRow(idx) {
    const section = sections[idx];
    updateSection(idx, { fields: [...(section.fields || []), { label: '', value: '' }] });
  }

  function updateFieldRow(idx, rowIdx, key, value) {
    const section = sections[idx];
    updateSection(idx, {
      fields: section.fields.map((f, i) => (i === rowIdx ? { ...f, [key]: value } : f)),
    });
  }

  function removeFieldRow(idx, rowIdx) {
    const section = sections[idx];
    updateSection(idx, { fields: section.fields.filter((_, i) => i !== rowIdx) });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Build the "Company Profile" area shown on the product page below the specifications — pick a block, fill it
        in, reorder or remove it. Leave empty to skip it entirely.
      </p>

      {/* Existing section blocks */}
      {sections.length > 0 && (
        <div className="space-y-4">
          {sections.map((section, idx) => {
            const meta = TYPE_META[section.type];
            const Icon = meta?.icon || Table2;
            return (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between gap-2 bg-slate-50 px-4 py-2.5 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
                    <Icon className="w-4 h-4 text-brand-navy shrink-0" />
                    {meta?.label || section.type}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveSection(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 text-gray-400 hover:text-brand-navy disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSection(idx, 1)}
                      disabled={idx === sections.length - 1}
                      className="p-1.5 text-gray-400 hover:text-brand-navy disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSection(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(idx, { title: e.target.value })}
                      placeholder={
                        section.type === 'infoTable'
                          ? 'e.g. Trading Capabilities'
                          : section.type === 'imageText'
                          ? 'e.g. Production Capacity'
                          : section.type === 'gallery'
                          ? 'e.g. Factory Photos'
                          : 'e.g. Site Advantages'
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                    />
                  </div>

                  {section.type === 'infoTable' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                        Rows
                      </label>
                      {(section.fields || []).map((row, rowIdx) => (
                        <div key={rowIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={row.label}
                            onChange={(e) => updateFieldRow(idx, rowIdx, 'label', e.target.value)}
                            placeholder="Label (e.g. Year Established)"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
                          />
                          <input
                            type="text"
                            value={row.value}
                            onChange={(e) => updateFieldRow(idx, rowIdx, 'value', e.target.value)}
                            placeholder="Value (e.g. 2021)"
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
                          />
                          <button
                            type="button"
                            onClick={() => removeFieldRow(idx, rowIdx)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            aria-label="Remove row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addFieldRow(idx)}
                        className="flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Row
                      </button>
                    </div>
                  )}

                  {(section.type === 'richText' || section.type === 'imageText') && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                        Content
                      </label>
                      <textarea
                        value={section.body}
                        onChange={(e) => updateSection(idx, { body: e.target.value })}
                        rows={4}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
                      />
                    </div>
                  )}

                  {section.type === 'imageText' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                        Image
                      </label>
                      <ImageUploader
                        images={section.image ? [section.image] : []}
                        onChange={(imgs) => updateSection(idx, { image: imgs[0] || '' })}
                        max={1}
                      />
                    </div>
                  )}

                  {section.type === 'gallery' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                        Images
                      </label>
                      <ImageUploader
                        images={section.images || []}
                        onChange={(imgs) => updateSection(idx, { images: imgs })}
                        max={8}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add new block */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SECTION_TYPES.map(({ type, label, hint, icon: Icon }) => (
          <button
            key={type}
            type="button"
            onClick={() => addSection(type)}
            title={hint}
            className="flex flex-col items-center gap-1.5 text-center border border-dashed border-gray-300 hover:border-brand-navy hover:bg-slate-50 rounded-xl px-3 py-4 transition-colors"
          >
            <Icon className="w-5 h-5 text-brand-navy" />
            <span className="text-xs font-bold text-gray-700">{label}</span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-brand-navy uppercase tracking-wide">
              <Plus className="w-3 h-3" /> Add
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
