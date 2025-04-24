
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import UploadClipModal from '@/components/UploadClipModal';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function DashboardClipsPage() {
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  useEffect(() => {
    async function fetchClips() {
      setLoading(true);
      const snap = await getDocs(
        query(
          collection(db, 'clips'),
          orderBy('createdAt', 'desc')
        )
      );
      setClips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchClips();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clips</h1>
        <Button onClick={() => setIsUploadOpen(true)}>+ Upload Clip</Button>
      </div>

      <UploadClipModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={async () => {
          // refresh list after upload
          const snap = await getDocs(
            query(
              collection(db, 'clips'),
              orderBy('createdAt', 'desc')
            )
          );
          setClips(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }}
      />

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map(clip => (
            <div key={clip.id} className="bg-gray-900 rounded-lg overflow-hidden">
              {clip.mediaUrl ? (
                <video
                  src={clip.mediaUrl}
                  controls
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 bg-gray-800 flex items-center justify-center text-gray-500">
                  No video
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold truncate">{clip.title}</h2>
                <p className="text-sm text-gray-400">Creator: {clip.username}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Views: {clip.views || 0} • Tips: ${(clip.tips || 0).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

