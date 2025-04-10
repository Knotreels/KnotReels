'use client';

import { useState } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);

    try {
      let finalMediaUrl = data.mediaUrl;

      // If file is selected, upload it to Firebase Storage
      if (file) {
        const fileRef = ref(storage, `uploads/${uuidv4()}-${file.name}`);
        await uploadBytes(fileRef, file);
        finalMediaUrl = await getDownloadURL(fileRef);
      }

      if (!finalMediaUrl) {
        alert('Please provide a media URL or upload a file.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'clips'), {
        title: data.title,
        mediaUrl: finalMediaUrl,
        category: data.category,
        uid: auth.currentUser?.uid ?? "unknown",
        createdAt: serverTimestamp(),
      });

      alert('✅ Content uploaded successfully!');
      router.push('/dashboard/profiles');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 bg-[#0a0a0a] p-8 rounded-lg text-white shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">📤 Upload Content</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block mb-1 text-sm">Title</label>
          <Input placeholder="Enter a title..." {...register('title')} />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Media URL */}
        <div>
          <label className="block mb-1 text-sm">Media URL (optional)</label>
          <Input
            placeholder="Paste a video/image URL"
            {...register('mediaUrl')}
          />
          <p className="text-xs text-gray-400 mt-1">
            e.g. From Runway, MidJourney, Imgur, etc.
          </p>
        </div>

        {/* OR Upload File */}
        <div>
          <label className="block mb-1 text-sm">Or Upload a File</label>
          <input
            type="file"
            accept="video/*,image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm w-full bg-[#1a1a1a] p-2 rounded border border-gray-600"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-1 text-sm">Select Category</label>
          <select
            {...register('category')}
            className="w-full p-2 rounded bg-[#1a1a1a] border border-gray-600"
          >
            <option value="">Choose a category</option>
            {CATEGORIES.filter((cat) => cat.title).map((cat, idx) => (
              <option key={idx} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
        </div>

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Content'}
        </Button>
      </form>
    </div>
  );
}
