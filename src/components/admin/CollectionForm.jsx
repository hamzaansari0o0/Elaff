'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { slugify } from '@/lib/slugify';
import ImageUploader from '@/components/admin/ImageUploader';

export default function CollectionForm({ initialData, collectionId }) {
  const router = useRouter();
  const isEdit = Boolean(collectionId);

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleTitleChange(value) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = { title, slug, description, image };
    const res = await fetch(isEdit ? `/api/collections/${collectionId}` : '/api/collections', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Something went wrong');
      return;
    }

    router.push('/admin/collections');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
          Slug (used in the URL /collection/&lt;slug&gt;)
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy transition-colors font-mono"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
          Cover Image
        </label>
        <ImageUploader images={image ? [image] : []} onChange={(imgs) => setImage(imgs[0] || '')} max={1} />
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-brand-cta hover:bg-brand-cta-hover disabled:opacity-60 text-white font-bold text-xs px-6 py-3 rounded-lg uppercase tracking-wider transition-colors"
      >
        {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Collection'}
      </button>
    </form>
  );
}
