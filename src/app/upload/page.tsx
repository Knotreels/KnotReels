'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { db, storage, auth } from '@/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { CATEGORIES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  mediaUrl: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
});

export default function UploadContentPage() {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // ✅ Redirect if not signed in
  useEffect(() => {
    if (!auth.currentUser) {
      alert('❌ You must be signed in to upload!');
      router.push('/login');
    }

    const escListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', escListener);
    return () => window.removeEventListener('keydown', escListener);
  }, [router]);

  // ✅ Close on outside click
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      router.back();
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      if (!auth.currentUser) {
        alert('You must be signed in to upload.');
        return;
      }

      let finalMediaUrl = data.mediaUrl;

      if (file) {
        const fileRef = ref(storage, `uploads/${uuidv4()}-${file.name}`);
        await uploadBytes(fileRef, file);
        finalMediaUrl = await getDownloadURL(fileRef);
      }

      if (!finalMediaUrl) {
        alert('Please provide a media URL or upload a file.');
        return;
      }

      await addDoc(collection(db, 'clips'), {
        title: data.title,
        mediaUrl: finalMediaUrl,
        category: data.category,
        uid: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });

      alert('✅ Content uploaded successfully!');
      router.push('/dashboard/profiles');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 📷 Preview uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      <div
        ref={modalRef}
        className="bg-[#0a0a0a] w-full max-w-lg p-6 rounded-xl shadow-2xl relative border border-gray-700"
      >
        <button
          onClick={() => router.back()}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
          aria-label="Close Upload Modal"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold mb-6 text-center text-white">📤 Upload Content</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Title</label>
            <Input placeholder="Enter a title..." {...register('title')} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Media URL */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Media URL (optional)</label>
            <Input placeholder="Paste a video/image URL" {...register('mediaUrl')} />
            <p className="text-xs text-gray-500 mt-1">e.g. From Runway, MidJourney, Imgur, etc.</p>
          </div>

          {/* Upload File */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Or Upload a File</label>
            <input
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="text-sm w-full bg-[#1a1a1a] p-2 rounded border border-gray-600 text-white"
            />
            {previewUrl && (
              <div className="mt-3 rounded overflow-hidden border border-gray-700">
                {file?.type.startsWith('video') ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Select Category</label>
            <select
              {...register('category')}
              className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-600 text-white"
            >
              <option value="">Choose a category</option>
              {CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat.title}>
                  {cat.title}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </form>
      </div>
    </div>
  );
}
