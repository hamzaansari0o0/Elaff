'use client';

import { Plus, Trash2 } from 'lucide-react';
import ImageUploader from '@/components/admin/ImageUploader';

export default function CertificationsEditor({ certifications, onChange }) {
  function addCertification() {
    onChange([...certifications, { name: '', image: '' }]);
  }

  function updateCertification(idx, patch) {
    onChange(certifications.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function removeCertification(idx) {
    onChange(certifications.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-4">
      {certifications.length === 0 ? (
        <p className="text-xs text-gray-400">No certifications added yet.</p>
      ) : (
        <div className="space-y-3">
          {certifications.map((cert, idx) => (
            <div key={idx} className="flex items-start gap-3 border border-gray-200 rounded-lg p-3">
              <ImageUploader
                images={cert.image ? [cert.image] : []}
                onChange={(imgs) => updateCertification(idx, { image: imgs[0] || '' })}
                max={1}
              />
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                  Certification Name
                </label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(idx, { name: e.target.value })}
                  placeholder="e.g. ISO 9001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
              </div>
              <button
                type="button"
                onClick={() => removeCertification(idx)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addCertification}
        className="flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline"
      >
        <Plus className="w-3.5 h-3.5" /> Add Certification
      </button>
    </div>
  );
}
