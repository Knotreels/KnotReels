'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import Image from 'next/image';

export default function CategoryPage() {
  const { slug } = useParams();
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClips = async () => {
      const q = query(
        collection(db, 'clips'),
        where('category', '==', slug),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setClips(data);
      setLoading(false);
    };

    fetchClips();
  }, [slug]);

  if (loading) {
    return <div className="p-10 text-white">Loading {slug} Reels...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold capitalize text-white">
        {slug} Reels
      </h1>

      {clips.length === 0 ? (
        <p className="text-gray-400">No content yet in this category.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map(clip => (
            <div
              key={clip.id}
              className="bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-700"
            >
              {clip.mediaUrl ? (
                <video
                  src={clip.mediaUrl}
                  className="w-full h-40 object-cover"
                  controls
                />
              ) : (
                <div className="h-40 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                  No video uploaded
                </div>
              )}
              <div className="p-3">
                <h4 className="font-medium text-sm text-white">
                  {clip.title || 'Untitled'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Views: {clip.views || 0} • Tips: ${clip.tips?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}