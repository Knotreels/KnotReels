'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { FaEye, FaDollarSign, FaCommentDots, FaTimes } from 'react-icons/fa';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function CategoryPage() {
  const { slug } = useParams();
  const { user: currentUser } = useAuth();                        // ← pull in auth

  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchCategoryClips = async () => {
      try {
        // 1) fetch the clips in this category
        const q = query(
          collection(db, 'categories', slug as string, 'clips'),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const clipsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClips(clipsData);

        // 2) subscribe to comments sub-collection under each clip
        clipsData.forEach((clip) => {
          const commentsRef = collection(
            db,
            'categories',
            slug as string,
            'clips',
            clip.id,
            'comments'
          );
          onSnapshot(commentsRef, (snap) => {
            setComments((prev) => ({
              ...prev,
              [clip.id]: snap.docs.map(d => d.data()),
            }));
          });
        });
      } catch (err) {
        console.error('Error fetching clips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryClips();
  }, [slug]);

  const handleSubmitComment = async (clipId: string) => {
    if (!newComment.trim() || !currentUser?.uid) return;

    try {
      // 1) look up the signed-in user's profile doc
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        console.warn('No user record found for:', currentUser.uid);
        return;
      }
      const usr = userSnap.data();
      const realUsername = usr.username as string;
      const realAvatar = usr.avatar as string | undefined;

      // 2) add the comment with their true username/avatar
      const commentRef = collection(
        db,
        'categories',
        slug as string,
        'clips',
        clipId,
        'comments'
      );
      await addDoc(commentRef, {
        text: newComment.trim(),
        user: realUsername,
        avatar: realAvatar || '/default-avatar.png',
        createdAt: serverTimestamp(),
      });

      setNewComment('');
    } catch (err) {
      console.error('Failed to submit comment:', err);
      alert("❌ Failed to submit comment");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white capitalize">
        {slug?.toString().replace(/-/g, ' ')} Clips
      </h1>

      {loading ? (
        <p className="text-gray-400">Loading clips...</p>
      ) : clips.length === 0 ? (
        <p className="text-gray-400">No clips found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="bg-black rounded border border-gray-700 overflow-hidden"
            >
              <video
                src={clip.mediaUrl}
                className="w-full h-48 object-cover"
                controls
              />

              <div className="p-3 text-white text-sm">
                <div className="font-semibold truncate">{clip.title}</div>
                <div className="text-xs text-gray-400">
                  creator: {clip.username || 'unknown'}
                </div>
                <div className="flex gap-3 items-center text-xs mt-2 text-gray-300">
                  <span className="flex items-center gap-1">
                    <FaEye /> {clip.views || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaDollarSign /> ${clip.tips?.toFixed(2) || '0.00'}
                  </span>
                  <button
                    onClick={() => setActiveClipId(clip.id)}
                    className="flex items-center gap-1 text-blue-400 hover:text-white"
                  >
                    <FaCommentDots /> {comments[clip.id]?.length || 0}
                  </button>
                </div>
              </div>

              {/* 💬 Comment Modal */}
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
                              <p className="font-semibold text-white text-xs">{c.user}</p>
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
