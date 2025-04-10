'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';

export default function ClipsPage() {
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClips = async () => {
      const q = query(collection(db, 'clips'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClips(data);
      setLoading(false);
    };

    fetchClips();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">All KnotReels Clips</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : clips.length === 0 ? (
        <p className="text-gray-400">No clips uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-700"
            >
              <video
                src={clip.mediaUrl}
                className="w-full h-40 object-cover"
                controls
              />
              <div className="p-3">
                <h4 className="font-medium text-sm">
                  {clip.title || 'Untitled'}
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Creator: {clip.username || 'Unknown'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
