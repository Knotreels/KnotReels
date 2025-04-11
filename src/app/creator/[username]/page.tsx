'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  Timestamp,
  onSnapshot,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import Image from 'next/image';
import LogoLoader from '@/components/LogoLoader';
import { Button } from '@/components/ui/button';
import { handleBoost } from '@/lib/firestore/handleBoost';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { TipModal } from '@/components/TipModal';
import { FaTimes } from 'react-icons/fa';

export default function PublicProfilePage() {
  const { username } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [viewedClips, setViewedClips] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userSnap = await getDocs(
          query(collection(db, 'users'), where('username', '==', username))
        );

        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() };
          setCreator(userData);

          const clipsSnap = await getDocs(
            query(collection(db, 'clips'), where('uid', '==', userDoc.id), orderBy('createdAt', 'desc'))
          );
          const clipData = clipsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setClips(clipData);

          clipData.forEach((clip) => {
            const q = query(
              collection(db, 'comments'),
              where('clipId', '==', clip.id),
              orderBy('createdAt', 'desc')
            );
            onSnapshot(q, (snap) => {
              setComments((prev) => ({
                ...prev,
                [clip.id]: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
              }));
            });
          });
        }
      } catch (err) {
        console.error('❌ Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username]);

  const handleBoostClick = async () => {
    if (!creator?.id || !currentUser?.uid) return;
    if (currentUser.uid === creator.id) return toast({ title: "You can't boost yourself!" });

    try {
      const prev = creator.boosts || 0;
      const success = await handleBoost(creator.id, currentUser.uid);
      if (success) {
        setCreator((prevState: any) => ({
          ...prevState,
          boosts: prev + 1,
        }));
      }
    } catch (err) {
      console.error('⚠️ Boost failed:', err);
    }
  };

  const handleView = async (clipId: string) => {
    if (viewedClips.has(clipId)) return;

    try {
      const clipRef = doc(db, 'clips', clipId);
      await updateDoc(clipRef, {
        views: increment(1),
      });
      setViewedClips((prev) => new Set(prev).add(clipId));
    } catch (err) {
      console.error("Failed to increment views:", err);
    }
  };

  const handleSubmitComment = async (clipId: string) => {
    if (!newComment.trim() || !currentUser) return;

    await addDoc(collection(db, 'comments'), {
      clipId,
      text: newComment,
      user: currentUser.displayName || "Creator",
      avatar: currentUser.photoURL || "/default-avatar.png",
      createdAt: Timestamp.now(),
    });

    setNewComment('');
  };

  if (loading) return <LogoLoader />;
  if (!creator) return <div className="p-6 text-white">Creator not found.</div>;

  return (
    <div className="space-y-10 px-6 pt-10 text-white">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Image src={creator.avatar || '/default-avatar.png'} alt="Avatar" width={64} height={64} className="rounded-full object-cover border border-gray-700" />
        <div>
          <h2 className="text-2xl font-semibold">{creator.username}</h2>
          <p className="text-sm text-gray-400">Featured Creator</p>
          <div className="flex gap-3 mt-3">
            <Button onClick={handleBoostClick} className="bg-blue-600 hover:bg-blue-700">🚀 Boost Creator</Button>
            <TipModal creatorId={creator.id} username={creator.username} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Boosts" value={creator.boosts || 0} />
        <Stat label="Views" value={creator.views || 0} />
      </div>

      {/* Reels */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Creator Reels</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <div key={clip.id} className="bg-[#1a1a1a] rounded overflow-hidden border border-gray-700 relative">
              <video
                src={clip.mediaUrl}
                className="w-full h-40 object-cover"
                controls
                onPlay={() => handleView(clip.id)}
              />
              <div className="relative p-3 bg-gradient-to-t from-black/80 to-transparent">
                <h4 className="text-sm font-semibold">{clip.title}</h4>
                <p className="text-xs text-gray-300">Views: {clip.views || 0} • Tips: ${clip.tips?.toFixed(2) || '0.00'}</p>
                <div className="flex gap-2 mt-2">
                  <TipModal creatorId={creator.id} username={creator.username} />
                  <button
                    onClick={() => setActiveClipId(clip.id)}
                    className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition"
                  >
                     Comments
                  </button>
                </div>
              </div>

              {/* Comment Modal */}
              {activeClipId === clip.id && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                  <div className="bg-[#121212] p-6 rounded-lg w-full max-w-md relative shadow-lg text-white">
                    <button onClick={() => setActiveClipId(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                      <FaTimes />
                    </button>
                    <h2 className="text-xl font-bold mb-4"> Comments</h2>

                    <div className="max-h-64 overflow-y-auto mb-4 border border-zinc-800 p-3 rounded bg-zinc-900/60 space-y-2">
                      {comments[clip.id]?.length ? (
                        comments[clip.id].map((c, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                            <Image src={c.avatar || "/default-avatar.png"} alt="avatar" width={24} height={24} className="rounded-full object-cover" />
                            <div className="bg-zinc-800 p-2 rounded-lg w-full">
                              <p className="font-semibold text-white text-xs">{c.user || 'Anon'}</p>
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
                      <button onClick={() => handleSubmitComment(clip.id)} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#1e1e1e] p-4 rounded-lg text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
