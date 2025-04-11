'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  increment,
  where,
  onSnapshot,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { FaCommentDots, FaEye, FaDollarSign, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function ClipsPage() {
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [viewedClips, setViewedClips] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState("");

  const { currentUser } = useAuth();

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

      data.forEach((clip) => {
        const commentQuery = query(
          collection(db, 'comments'),
          where('clipId', '==', clip.id)
        );
        onSnapshot(commentQuery, (snap) => {
          setComments((prev) => ({
            ...prev,
            [clip.id]: snap.docs.map((doc) => doc.data()),
          }));
        });
      });
    };

    fetchClips();
  }, []);

  const handleView = async (clipId: string) => {
    if (viewedClips.has(clipId)) return;
    try {
      const clipRef = doc(db, 'clips', clipId);
      await updateDoc(clipRef, { views: increment(1) });
      setViewedClips((prev) => new Set(prev).add(clipId));
    } catch (err) {
      console.error("Error updating view count:", err);
    }
  };

  const handleSubmitComment = async (clipId: string) => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      alert('🔒 You must be signed in to comment.');
      return;
    }

    try {
      await addDoc(collection(db, 'comments'), {
        clipId,
        text: newComment.trim(),
        user: currentUser.displayName || currentUser.email || 'Anon',
        avatar: currentUser.photoURL || '/default-avatar.png',
        createdAt: Timestamp.now(),
      });
      setNewComment('');
    } catch (err) {
      console.error('❌ Failed to post comment:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">All KnotReels Clips</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : clips.length === 0 ? (
        <p className="text-gray-400">No clips uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="relative group bg-black rounded overflow-hidden border border-gray-700"
            >
              <video
                src={clip.mediaUrl}
                className="w-full h-48 object-cover"
                muted
                controls
                onPlay={() => handleView(clip.id)}
              />

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3 text-white">
                <div className="text-sm font-semibold truncate">
                  {clip.title || 'Untitled'}
                </div>
                <div className="text-xs text-gray-300">
                  Creator: {clip.username || 'Unknown'}
                </div>
                <div className="flex gap-4 text-xs items-center mt-2">
                  <div className="flex items-center gap-1">
                    <FaEye className="text-gray-400" /> {clip.views || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaDollarSign className="text-green-400" /> $
                    {clip.tips?.toFixed(2) || '0.00'}
                  </div>
                  <button
                    onClick={() => setActiveClipId(clip.id)}
                    className="flex items-center gap-1 text-blue-400 hover:text-white transition"
                  >
                    <FaCommentDots /> {comments[clip.id]?.length || 0}
                  </button>
                </div>
              </div>

              {activeClipId === clip.id && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                  <div className="bg-[#121212] p-6 rounded-lg w-full max-w-md relative shadow-lg text-white">
                    <button
                      onClick={() => setActiveClipId(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                      <FaTimes />
                    </button>
                    <h2 className="text-xl font-bold mb-4">Comments</h2>

                    <div className="max-h-64 overflow-y-auto mb-4 border border-zinc-800 p-3 rounded bg-zinc-900/60 space-y-2">
                      {comments[clip.id]?.length ? (
                        comments[clip.id].map((c, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                            <Image
                              src={c.avatar || "/default-avatar.png"}
                              alt="avatar"
                              width={24}
                              height={24}
                              className="rounded-full object-cover"
                            />
                            <div className="bg-zinc-800 p-2 rounded-lg w-full">
                              <p className="font-semibold text-white text-xs">
                                {c.user || 'Anon'}
                              </p>
                              <p>{c.text}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No comments yet.</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 p-2 rounded bg-zinc-800 border border-zinc-600 outline-none"
                      />
                      <button
                        onClick={() => handleSubmitComment(clip.id)}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
