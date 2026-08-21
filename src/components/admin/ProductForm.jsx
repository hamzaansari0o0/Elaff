'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { slugify } from '@/lib/slugify';
import ImageUploader from '@/components/admin/ImageUploader';
import PageSectionsBuilder from '@/components/admin/PageSectionsBuilder';

const TAG_OPTIONS = [
  { value: 'onSale', label: 'On Sale' },
  { value: 'weeklyFeatured', label: 'Weekly Featured' },
  { value: 'bestseller', label: 'Bestseller' },
];

export default function ProductForm({ initialData, productId }) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [collections, setCollections] = useState([]);
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [sku, setSku] = useState(initialData?.sku || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [selectedCollections, setSelectedCollections] = useState(
    initialData?.collections?.map((c) => (typeof c === 'string' ? c : c._id)) || []
  );
  const [price, setPrice] = useState(initialData?.price ?? '');
  const [priceUnit, setPriceUnit] = useState(initialData?.priceUnit || '');
  const [oldPrice, setOldPrice] = useState(initialData?.oldPrice ?? '');
  const [badge, setBadge] = useState(initialData?.badge || '');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [status, setStatus] = useState(initialData?.status || 'active');
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [fullDescription, setFullDescription] = useState(initialData?.fullDescription || '');
  const [specifications, setSpecifications] = useState(initialData?.specifications || []);
  const [images, setImages] = useState(initialData?.images || []);
  const [pageSections, setPageSections] = useState(initialData?.pageSections || []);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then(setCollections);
  }, []);

  function handleTitleChange(value) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleCollection(id) {
    setSelectedCollections((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function toggleTag(value) {
    setTags((prev) => (prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]));
  }

  function addSpecRow() {
    setSpecifications((prev) => [...prev, { label: '', value: '' }]);
  }

  function updateSpecRow(idx, field, value) {
    setSpecifications((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  function removeSpecRow(idx) {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  }

  function isSectionMeaningful(section) {
    if (section.title?.trim()) return true;
    if (section.type === 'infoTable') return (section.fields || []).some((f) => f.label && f.value);
    if (section.type === 'richText') return Boolean(section.body?.trim());
    if (section.type === 'imageText') return Boolean(section.body?.trim() || section.image);
    if (section.type === 'gallery') return (section.images || []).length > 0;
    return false;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (images.length === 0) {
      setError('Please upload at least one product image.');
      return;
    }

    setLoading(true);

    const payload = {
      title,
      slug,
      sku,
      category,
      collections: selectedCollections,
      price: price === '' ? null : Number(price),
      priceUnit,
      oldPrice: oldPrice === '' ? null : Number(oldPrice),
      badge,
      tags,
      status,
      featured,
      shortDescription,
      fullDescription,
      specifications: specifications.filter((s) => s.label && s.value),
      images,
      pageSections: pageSections
        .filter(isSectionMeaningful)
        .map((s) =>
          s.type === 'infoTable' ? { ...s, fields: (s.fields || []).filter((f) => f.label && f.value) } : s
        ),
    };

    const res = await fetch(isEdit ? `/api/products/${productId}` : '/api/products', {
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

    router.push('/admin/products');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 pb-16">
      {/* Basic Info */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Basic Info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Slug (URL: /product/&lt;slug&gt;)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Category Label
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Agricultural Products"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy bg-white"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mt-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-brand-navy"
            />
            Featured Product
          </label>
        </div>
      </section>

      {/* Collections */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Collections</h2>
        {collections.length === 0 ? (
          <p className="text-xs text-gray-400">No collections yet — create one first.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <label
                key={c._id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  selectedCollections.includes(c._id)
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-navy'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(c._id)}
                  onChange={() => toggleCollection(c._id)}
                  className="hidden"
                />
                {c.title}
              </label>
            ))}
          </div>
        )}
      </section>

      {/* Pricing */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Pricing & Badge</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Price Unit
            </label>
            <input
              type="text"
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
              placeholder="/ ton"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
              Old Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={oldPrice}
              onChange={(e) => setOldPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Badge</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="SALE, HOT, NEW"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
            Homepage Sections
          </label>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                  tags.includes(opt.value)
                    ? 'bg-amber-100 text-brand-amber border-brand-amber'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-brand-amber'
                }`}
              >
                <input
                  type="checkbox"
                  checked={tags.includes(opt.value)}
                  onChange={() => toggleTag(opt.value)}
                  className="hidden"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Images</h2>
        <ImageUploader images={images} onChange={setImages} max={6} />
      </section>

      {/* Description */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Description</h2>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
            Short Description
          </label>
          <textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
            Full Description (HTML allowed, e.g. &lt;p&gt;...&lt;/p&gt;)
          </label>
          <textarea
            value={fullDescription}
            onChange={(e) => setFullDescription(e.target.value)}
            rows={5}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand-navy font-mono"
          />
        </div>
      </section>

      {/* Specifications */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Specifications</h2>
          <button
            type="button"
            onClick={addSpecRow}
            className="flex items-center gap-1 text-xs font-bold text-brand-navy hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Row
          </button>
        </div>

        {specifications.length === 0 ? (
          <p className="text-xs text-gray-400">No specifications added.</p>
        ) : (
          <div className="space-y-2">
            {specifications.map((spec, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={spec.label}
                  onChange={(e) => updateSpecRow(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. Protein Content)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecRow(idx, 'value', e.target.value)}
                  placeholder="Value (e.g. 60% Min)"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-navy"
                />
                <button
                  type="button"
                  onClick={() => removeSpecRow(idx)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Company Profile / Page Sections */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-wide">Company Profile Sections</h2>
        <PageSectionsBuilder sections={pageSections} onChange={setPageSections} />
      </section>

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
        {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
}
