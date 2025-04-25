// src/components/UploadModal.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { db, storage, auth } from '@/firebase/config';
import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CATEGORIES } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  mediaUrl: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
});

export default function UploadModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const escListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', escListener);
    return () => window.removeEventListener('keydown', escListener);
  }, [onClose]);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('You must be signed in to upload.');
        return;
      }

      // Determine final media URL (either user-pasted or uploaded file)
      let finalMediaUrl = data.mediaUrl;
      if (file) {
        const fileRef = ref(
          storage,
          `uploads/${currentUser.uid}/${uuidv4()}-${file.name}`
        );
        await uploadBytes(fileRef, file);
        finalMediaUrl = await getDownloadURL(fileRef);
      }
      if (!finalMediaUrl) {
        alert('Please provide a media URL or upload a file.');
        return;
      }

      // Fetch user profile data
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        alert('User not found. Please try again.');
        return;
      }
      const userData = userSnap.data();
      const username = userData.username?.trim() || 'Creator';
      const avatar = userData.avatar || '/default-avatar.png';

      // Prepare clip payload
      const categorySlug = data.category.toLowerCase().replace(/\s+/g, '-');
      const clipPayload = {
        title: data.title,
        description: data.description,
        mediaUrl: finalMediaUrl,
        category: data.category,
        categorySlug,
        uid: currentUser.uid,
        username,
        avatar,
        createdAt: serverTimestamp(),
      };

      // Write to category sub-collection
      await addDoc(
        collection(db, 'categories', categorySlug, 'clips'),
        clipPayload
      );
      // Also write to root clips collection
      await addDoc(collection(db, 'clips'), clipPayload);

      alert('✅ Content uploaded!');
      onClose();
      router.refresh?.();
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
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
        className="
          bg-[#0a0a0a]
          w-full
          max-w-lg
          p-6
          rounded-xl
          shadow-2xl
          relative
          border border-gray-700

          /* always show scrollbar, cap modal height */
          max-h-[90vh]
          overflow-y-scroll
          scrollbar
        "
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

        <h1 className="text-2xl font-semibold mb-6 text-center text-white">
          Upload Content
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">Title</label>
            <Input placeholder="Enter a title..." {...register('title')} />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Description
            </label>
            <textarea
              rows={4}
              className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-600 text-white outline-none"
              placeholder="Describe your film..."
              {...register('description')}
            />
            {errors.description && (
              <p className="text-red-400 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Media URL */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Media URL (optional)
            </label>
            <Input
              placeholder="Paste a video/image URL"
              {...register('mediaUrl')}
            />
            <p className="text-xs text-gray-500 mt-1">
              e.g. From Runway, MidJourney, Imgur, etc.
            </p>
          </div>

          {/* Upload File */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Or Upload a File
            </label>
            <input
              type="file"
              accept="video/*,image/*"
              onChange={handleFileChange}
              className="text-sm w-full bg-[#1a1a1a] p-2 rounded border border-gray-600 text-white"
            />

            {previewUrl && (
              <div
                className="
                  mt-3
                  rounded
                  border border-gray-700

                  /* always show scrollbar, cap preview height */
                  max-h-48
                  overflow-y-scroll
                  scrollbar
                "
              >
                {file?.type.startsWith('video') ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-auto object-contain bg-black"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto object-contain bg-black"
                  />
                )}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block mb-1 text-sm text-gray-300">
              Select Category
            </label>
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
              <p className="text-red-400 text-xs mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </form>
      </div>
    </div>
  );
}
