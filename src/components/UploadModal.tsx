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
    /* ... your existing upload logic ... */
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

          /* always show scrollbar, cap height to 90% */
          max-h-[90vh]
          overflow-y-scroll
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
          {/* Title, Description, Media URL unchanged */}

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

          {/* Category selector unchanged */}

          {/* Submit */}
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </form>
      </div>
    </div>
  );
}
