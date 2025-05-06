'use client';

import React, { useEffect, useState } from 'react';
import { useParams }                  from 'next/navigation';
import CommentModal                   from '@/components/CommentModal';
import { db }                         from '@/firebase/config';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { FaEye, FaDollarSign, FaCommentDots } from 'react-icons/fa';

export default function CategoryPage() {
  const { slug } = useParams();
  const [clips, setClips]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClips() {
      setLoading(true);
      const q = query(
        collection(db, 'clips'),
        where('categorySlug', '==', slug),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setClips(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      setLoading(false);
    }
    fetchClips();
  }, [slug]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white capitalize">
        {slug?.replace(/-/g, ' ')} Clips
      </h1>
      {loading ? (
        <p className="text-gray-400">Loading…</p>
      ) : clips.length === 0 ? (
        <p className="text-gray-400">No clips in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {clips.map(clip => (
            <div key={clip.id} className="bg-black rounded border overflow-hidden">
              <video src={clip.mediaUrl} controls className="w-full h-48 object-cover" />
              <div className="p-3 text-white">
                <div className="font-semibold">{clip.title}</div>
                <div className="text-xs text-gray-400">creator: {clip.username}</div>
                <div className="flex items-center gap-4 mt-2 text-gray-300 text-xs">
                  <FaEye /> {clip.views || 0}
                  <FaDollarSign /> ${clip.tips?.toFixed(2)||'0.00'}
                  <button
                    onClick={()=> setActiveClipId(prev=> prev===clip.id ? null : clip.id)}
                    className="text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <FaCommentDots /> Comments
                  </button>
                </div>
              </div>

              {activeClipId === clip.id && (
                <CommentModal
                  clipId={clip.id}
                  isOpen={true}
                  onClose={()=> setActiveClipId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
