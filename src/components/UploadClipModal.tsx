'use client';

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { FaTimes } from 'react-icons/fa';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClipUploadModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !file || !title.trim()) {
      alert('Please select a video and give it a title.');
      return;
    }
    setUploading(true);

    try {
      // 1) upload video bytes
      const clipId = uuidv4();
      const storageRef = ref(storage, `clips/${user.uid}/${clipId}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // 2) write clip doc
      await addDoc(collection(db, 'clips'), {
        uid:        user.uid,
        title:      title.trim(),
        mediaUrl:   url,
        views:      0,
        tips:       0,
        createdAt:  serverTimestamp(),
      });

      // reset + close
      setTitle('');
      setFile(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Upload failed, please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FaTimes />
        </button>
        <h2 className="text-xl font-semibold mb-4">Upload New Clip</h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring"
          placeholder="Your clip’s title"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video File
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={e => setFile(e.target.files?.[0] || null)}
          className="w-full mb-6"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded text-white ${
              uploading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Upload Clip'}
          </button>
        </div>
      </div>
    </div>
  );
}
