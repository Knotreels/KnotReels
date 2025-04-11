'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import Image from 'next/image';

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGalleryItems(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading gallery:', error);
      }
    };

    fetchGallery();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Gallery Showroom</h1>

      {loading ? (
        <p className="text-gray-400">Loading artwork...</p>
      ) : galleryItems.length === 0 ? (
        <p className="text-gray-400">No content uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-700">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title || 'Untitled'}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                  No image
                </div>
              )}
              <div className="p-3">
                <h4 className="font-medium text-sm text-white">
                  {item.title || 'Untitled'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Uploaded by: {item.username || 'Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
