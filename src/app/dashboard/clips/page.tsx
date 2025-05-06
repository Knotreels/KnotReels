'use client';
import MovieCard from '@/components/MovieCard';
import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import UploadClipModal from '@/components/UploadClipModal';
import { Button } from '@/components/ui/button';

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
            <MovieCard
              key={clip.id}
              movie={clip}
              showStats={true}
              className="bg-gray-900 rounded-lg overflow-hidden"
            />
          ))}
        </div>
      )}
    </div>
  );
}
