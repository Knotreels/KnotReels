'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db }                from '@/firebase/config';
import { useAuth }           from '@/context/AuthContext';
import LogoLoader            from '@/components/LogoLoader';
import CommentModal          from '@/components/CommentModal';
import { Button }            from '@/components/ui/button';

export default function MyClipsPage() {
  const { user } = useAuth();
  const [clips, setClips]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // pull from top-level "clips" by your uid
      const q = query(
        collection(db, 'clips'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setClips(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    })();
  }, [user]);

  if (!user || loading) return <LogoLoader />;

  return (
    <div className="p-6 text-white space-y-8">
      <h1 className="text-2xl font-bold">Your Clips</h1>
      {clips.length === 0 ? (
        <p className="text-gray-400">You haven’t uploaded any reels yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map(clip => (
            <div key={clip.id} className="bg-[#1a1a1a] rounded overflow-hidden">
              {clip.mediaUrl ? (
                <video
                  src={clip.mediaUrl}
                  controls
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 bg-gray-800 flex items-center justify-center">
                  No video
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg truncate">{clip.title}</h2>
                <Button
                  className="mt-2 bg-blue-600"
                  onClick={() => setActiveClipId(prev => (prev === clip.id ? null : clip.id))}
                >
                  Comments ({/* optional count here */})
                </Button>
              </div>
              {activeClipId === clip.id && (
                <CommentModal
                  clipId={clip.id}
                  isOpen={true}
                  onClose={() => setActiveClipId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
