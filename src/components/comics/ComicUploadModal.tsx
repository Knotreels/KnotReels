'use client';

import { useState } from 'react';
import { db, storage } from '@/firebase/config'; // ✅ keep your working path
import {
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth'; // ✅ for user UID
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

interface ComicUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComicUploadModal({ isOpen, onClose }: ComicUploadModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title || !author || !cover) {
      alert('Please fill all fields');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('You must be logged in to upload a comic.');
      return;
    }

    try {
      setIsUploading(true);
      const slug = title.toLowerCase().replace(/\s+/g, '-');
      const comicId = uuidv4();

      // ✅ Upload to correct storage path
      const storageRef = ref(storage, `comic-covers/${user.uid}/${comicId}`);
      await uploadBytes(storageRef, cover);
      const coverUrl = await getDownloadURL(storageRef);

      // ✅ Save comic to Firestore
      const comicRef = doc(db, 'comics', slug);
      await setDoc(comicRef, {
        title,
        author,
        slug,
        coverUrl,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload comic.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-lg p-6 relative">
        <h2 className="text-xl font-bold mb-4">Create a New Comic</h2>

        <label className="block mb-2">Title</label>
        <input
          className="w-full mb-4 p-2 border rounded text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="block mb-2">Author</label>
        <input
          className="w-full mb-4 p-2 border rounded text-black"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />

        <label className="block mb-2">Cover Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="text-black"
        />
        {coverPreview && (
          <div className="my-4">
            <Image
              src={coverPreview}
              alt="Cover Preview"
              width={200}
              height={300}
              className="object-contain"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Create Comic'}
          </button>
        </div>
      </div>
    </div>
  );
}
