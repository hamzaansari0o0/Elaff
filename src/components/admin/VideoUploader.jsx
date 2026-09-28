'use client';

import { useRef, useState } from 'react';
import { X, Upload, Loader2, Video } from 'lucide-react';

// Single-video counterpart to ImageUploader — a product has at most one video,
// shown in place of the main product image on the storefront gallery.
export default function VideoUploader({ video, onChange, collectionName = '' }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      // Videos upload straight from the browser to Cloudinary instead of
      // through our own /api/upload — Vercel's serverless functions cap
      // request bodies at 4.5MB, which most real product videos exceed, so
      // routing the file through our server would silently fail. We only
      // need a short-lived signature from our backend first.
      const signRes = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection: collectionName }),
      });
      if (!signRes.ok) throw new Error('Could not start upload');
      const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(data.error?.message || 'Upload failed');

      // Replacing an existing video: drop the old Cloudinary asset first so
      // it doesn't linger orphaned.
      if (video) {
        fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: video }),
        }).catch((err) => console.error('Failed to delete previous video from Cloudinary:', err));
      }
      onChange(data.secure_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function removeVideo() {
    const removedUrl = video;
    onChange('');
    fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: removedUrl }),
    }).catch((err) => console.error('Failed to delete video from Cloudinary:', err));
  }

  return (
    <div>
      {video ? (
        <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-gray-200 group bg-black">
          <video src={video} className="w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Video className="w-6 h-6 text-white/90" />
          </div>
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-navy flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-brand-navy transition-colors disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
          <span className="text-[10px] font-bold uppercase">{uploading ? 'Uploading' : 'Upload Video'}</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {error && <p className="text-xs font-semibold text-red-600 mt-2">{error}</p>}
    </div>
  );
}
