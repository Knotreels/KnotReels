'use client';

import {
  useEffect,
  useState,
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
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import Image from 'next/image';
import LogoLoader from '@/components/LogoLoader';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { TipModal } from '@/components/TipModal';
import { toast } from '@/hooks/use-toast';
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

  // track if current user has boosted this creator
  const [hasBoosted, setHasBoosted] = useState(false);

  // ─── fetch creator + clips + comments ────────────────────
  useEffect(() => {
    async function fetchCreator() {
      try {
        // 1) load user doc by username
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

        // 1a) check if we've already boosted them
        if (currentUser) {
          const boostRef = doc(
            db,
            'users',
            data.id,
            'boosts',
            currentUser.uid
          );
          const boostSnap = await getDoc(boostRef);
          setHasBoosted(boostSnap.exists());
        }

        // 2) fetch their clips
        const clipQ = query(
          collection(db, 'clips'),
          where('uid', '==', data.id),
          orderBy('createdAt', 'desc')
        );
        const clipSnap = await getDocs(clipQ);
        const clipList = clipSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClips(clipList);

        // 3) subscribe to comments on each clip
        clipList.forEach(clip => {
          const cQ = query(
            collection(db, 'comments'),
            where('clipId', '==', clip.id),
            orderBy('createdAt', 'desc')
          );
          onSnapshot(cQ, snap => {
            setComments(prev => ({
              ...prev,
              [clip.id]: snap.docs.map(c => ({ id: c.id, ...c.data() }))
            }));
          });
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCreator();
  }, [username, currentUser]);

  // ─── boost handler ───────────────────────────────────────
  const handleBoostClick = async () => {
    if (!currentUser || !creator) return;
    if (hasBoosted) {
      toast({ title: 'You’ve already boosted this creator', variant: 'destructive' });
      return;
    }

    try {
      // 1) record your boost
      const myBoostRef = doc(
        db,
        'users',
        creator.id,
        'boosts',
        currentUser.uid
      );
      await setDoc(myBoostRef, { createdAt: serverTimestamp() });

      // 2) increment the aggregate boosts count
      const creatorRef = doc(db, 'users', creator.id);
      await updateDoc(creatorRef, { boosts: increment(1) });

      // 3) refresh local creator & UI
      const fresh = await getDoc(creatorRef);
      setCreator({ id: fresh.id, ...fresh.data() });
      setHasBoosted(true);

      toast({ title: '🎉 Thank you for Boosting 🎉', variant: 'default' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Easy there , You have already Boosted this Creator,', variant: 'destructive' });
    }
  };

  if (loading) return <LogoLoader />;
  if (!creator) return <p className="p-6 text-white">Creator not found.</p>;

  return (
    <div className="space-y-10 px-6 pt-10 text-white">
      {/* ─── Header ───────────────────────────────────────── */}
      <div className="flex items-start gap-6">
        <div className="relative w-16 h-16">
          <Image
            src={creator.avatar || '/default-avatar.png'}
            alt={creator.username}
            fill
            className="rounded-full object-cover border border-gray-700"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{creator.username}</h2>
            {!isOwnProfile && (
              <>
                <Button
                  onClick={handleBoostClick}
                  disabled={hasBoosted}
                  className={hasBoosted ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  🚀 Boost ({creator.boosts || 0})
                </Button>
                <TipModal
                  creatorId={creator.id}
                  username={creator.username}
                />
              </>
            )}
          </div>
          {creator.bio && (
            <p className="mt-2 text-gray-300 max-w-md">{creator.bio}</p>
          )}
        </div>
      </div>

      {/* ─── Clips ──────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Clips</h3>
        {clips.length === 0 ? (
          <p className="text-gray-500">No clips uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map(clip => (
              <div key={clip.id} className="bg-[#1a1a1a] rounded-md overflow-hidden">
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
                  <h4 className="text-sm font-semibold truncate">
                    {clip.title}
                  </h4>
                  <button
                    onClick={() =>
                      setActiveClipId(id => (id === clip.id ? null : clip.id))
                    }
                    className="mt-2 text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20"
                  >
                    Comments ({comments[clip.id]?.length || 0})
                  </button>
                </div>

                {/* ─── Comment Modal ───────────────────────── */}
                {activeClipId === clip.id && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#121212] rounded-lg w-full max-w-md p-6 relative">
                      <button
                        onClick={() => setActiveClipId(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                      >
                        <FaTimes />
                      </button>
                      <h2 className="text-xl mb-4">Comments</h2>
                      <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                        {(comments[clip.id] || []).map(c => (
                          <div key={c.id} className="flex items-start gap-3">
                            <Image
                              src={c.avatar || '/default-avatar.png'}
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
                        {!comments[clip.id]?.length && (
                          <p className="text-gray-500 text-sm">No comments yet</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={e => setNewComment(e.target.value)}
                          className="flex-1 p-2 rounded bg-zinc-800 text-white outline-none border border-zinc-600"
                        />
                        <Button
                          onClick={async () => {
                            if (!newComment.trim() || !currentUser?.uid) return;
                            // look up real username/avatar
                            const userRef = doc(db, 'users', currentUser.uid);
                            const snap = await getDoc(userRef);
                            if (!snap.exists()) return;
                            const { username: realUsername, avatar: realAvatar } =
                              snap.data() as any;
                            if (!realUsername) return;
                            // add comment
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
        )}
      </div>
    </div>
  );
}
