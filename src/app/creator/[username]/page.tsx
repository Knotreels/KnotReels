'use client';

import {
  useEffect,
  useState,
  useRef,
} from 'react';
import { useParams } from 'next/navigation';
import { db } from '@/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  addDoc,
  Timestamp,
  doc,
  getDoc,
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
  const { user: currentUser } = useAuth();

  const [creator, setCreator] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // ─── Countdown / Featured logic omitted for brevity ─────────────────────

  useEffect(() => {
    async function fetchCreator() {
      try {
        // 1) load user by username
        const userSnap = await getDocs(
          query(collection(db, 'users'), where('username', '==', username))
        );
        if (userSnap.empty) {
          setCreator(null);
          return;
        }
        const docSnap = userSnap.docs[0];
        const data = { id: docSnap.id, ...docSnap.data() };
        setCreator(data);
        setIsOwnProfile(currentUser?.uid === docSnap.id);

        // 2) load clips
        const clipSnap = await getDocs(
          query(
            collection(db, 'clips'),
            where('uid', '==', data.id),
            orderBy('createdAt', 'desc')
          )
        );
        const clipList = clipSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setClips(clipList);

        // 3) subscribe to comments for each clip
        clipList.forEach((clip) => {
          const cQ = query(
            collection(db, 'comments'),
            where('clipId', '==', clip.id),
            orderBy('createdAt', 'desc')
          );
          onSnapshot(cQ, (snap) =>
            setComments((prev) => ({
              ...prev,
              [clip.id]: snap.docs.map((c) => ({ id: c.id, ...c.data() })),
            }))
          );
        });

        // 4) featured countdown if needed...
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreator();
  }, [username, currentUser]);

  if (loading) return <LogoLoader />;
  if (!creator) return <div className="p-6 text-white">Creator not found.</div>;

  return (
    <div className="space-y-10 px-6 pt-10 text-white">
      {/* Header + boost UI omitted for brevity */}

      <div>
        <h3 className="text-xl font-semibold mb-4">Clips</h3>
        {clips.length === 0 && <p className="text-gray-500">No clips uploaded yet.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <div
              key={clip.id}
              className="bg-[#1a1a1a] rounded-md overflow-hidden"
            >
              {clip.mediaUrl ? (
                <video
                  src={clip.mediaUrl}
                  controls
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="h-48 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                  No video
                </div>
              )}

              <div className="p-3 bg-gradient-to-t from-black/80 to-transparent">
                <h4 className="text-sm font-semibold truncate">{clip.title}</h4>
                <p className="text-xs text-gray-300">
                  Views: {clip.views || 0} • Tips: ${clip.tips?.toFixed(2) || '0.00'}
                </p>
                <button
                  onClick={() =>
                    setActiveClipId((id) => (id === clip.id ? null : clip.id))
                  }
                  className="mt-2 text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20"
                >
                  Comments
                </button>
              </div>

              {/* Comment Modal */}
              {activeClipId === clip.id && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                  <div className="bg-[#121212] rounded-lg w-full max-w-md p-6 relative">
                    <button
                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                      onClick={() => setActiveClipId(null)}
                    >
                      <FaTimes />
                    </button>
                    <h2 className="text-xl mb-4">Comments</h2>

                    <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                      {(comments[clip.id] || []).map((c) => (
                        <div key={c.id} className="flex items-start gap-3">
                          <Image
                            src={c.avatar}
                            width={28}
                            height={28}
                            className="rounded-full"
                            alt={c.user}
                          />
                          <div className="bg-zinc-800 p-2 rounded-lg w-full">
                            <p className="font-semibold text-white text-xs">
                              {c.user}
                            </p>
                            <p className="text-gray-300 text-sm">{c.text}</p>
                          </div>
                        </div>
                      ))}
                      {!(comments[clip.id]?.length) && (
                        <p className="text-gray-500 text-sm">No comments yet</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        className="flex-1 p-2 bg-zinc-800 rounded border border-zinc-600"
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        onClick={async () => {
                          if (!newComment.trim() || !currentUser?.uid) return;

                          // fetch the real username/avatar from Firestore
                          const userRef = doc(db, 'users', currentUser.uid);
                          const userSnap = await getDoc(userRef);
                          if (!userSnap.exists()) return;
                          const { username: realUsername, avatar: realAvatar } =
                            userSnap.data() as {
                              username?: string;
                              avatar?: string;
                            };
                          if (!realUsername) return;

                          // write comment with real username/avatar
                          await addDoc(collection(db, 'comments'), {
                            clipId: clip.id,
                            text: newComment.trim(),
                            user: realUsername,
                            avatar: realAvatar || '/default-avatar.png',
                            createdAt: Timestamp.now(),
                          });
                          setNewComment('');
                        }}
                      >
                        Send
                      </Button>
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
