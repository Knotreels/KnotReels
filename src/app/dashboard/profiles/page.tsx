'use client';

import {
  useEffect,
  useState,
  useRef,
  ChangeEvent,
} from 'react';
import {
  auth,
  db,
  storage,
} from '@/firebase/config';
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import LogoLoader from '@/components/LogoLoader';
import { FaTimes } from 'react-icons/fa';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const prevBoostsRef = useRef<number | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);

        const unsubscribeBoosts = onSnapshot(userRef, (docSnap) => {
          const data = docSnap.data();
          if (!data) return;
          setUser({ uid: currentUser.uid, ...data });

          const currentBoosts = data.boosts || 0;
          if (prevBoostsRef.current !== null && currentBoosts > prevBoostsRef.current) {
            alert('🚀 You’ve just been boosted by a fan!');
          }
          prevBoostsRef.current = currentBoosts;
        });

        const clipsQuery = query(
          collection(db, 'clips'),
          where('uid', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const clipsSnap = await getDocs(clipsQuery);
        const clipData = clipsSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));

        setClips(clipData);

        // 🔁 Sync comments per clip
        clipData.forEach((clip) => {
          const q = query(
            collection(db, 'comments'),
            where('clipId', '==', clip.id),
            orderBy('createdAt', 'desc')
          );

          onSnapshot(q, (snapshot) => {
            setComments((prev) => ({
              ...prev,
              [clip.id]: snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })),
            }));
          });
        });

        const viewsSum = clipData.reduce((acc, clip) => acc + (clip.views || 0), 0);
        setTotalViews(viewsSum);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return alert('No file or user found.');
    if (!file.type.startsWith('image/')) return alert('❌ Only image files allowed.');

    try {
      const avatarPath = `avatars/${user.uid}/profile.jpg`;
      const avatarRef = ref(storage, avatarPath);
      await uploadBytes(avatarRef, file);
      const avatarUrl = await getDownloadURL(avatarRef);

      await updateDoc(doc(db, 'users', user.uid), { avatar: avatarUrl });
      setUser((prev: any) => ({ ...prev, avatar: avatarUrl }));
      alert('✅ Avatar updated successfully!');
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('❌ Upload failed. Check the console.');
    }
  };

  const handleTip = async (clipOwnerUid: string) => {
    if (!clipOwnerUid) return alert("❌ No creator UID provided.");
    if (!user) return alert("🔒 You must be logged in to tip.");
    if (clipOwnerUid === user.uid) return alert("🚫 You can't tip yourself!");

    try {
      const creatorRef = doc(db, 'users', clipOwnerUid);
      await updateDoc(creatorRef, {
        tips: (user.tips || 0) + 1,
      });
      alert('💸 Tip sent successfully!');
    } catch (err) {
      console.error('❌ Tip failed:', err);
      alert('Something went wrong. Check console.');
    }
  };

  const handleSubmitComment = async (clipId: string) => {
    if (!newComment.trim() || !user) return;

    await addDoc(collection(db, 'comments'), {
      clipId,
      text: newComment,
      user: user.username || "Anon",
      avatar: user.avatar || "/default-avatar.png",
      createdAt: Timestamp.now(),
    });

    setNewComment('');
  };

  if (loading) return <LogoLoader />;
  if (!user) return <div className="p-6 text-white">User not found.</div>;

  return (
    <div className="space-y-10 px-6 pt-10 text-white">
      {/* Avatar + Info */}
      <div className="flex items-center gap-6">
        <div className="relative group w-16 h-16">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <Image
            src={user.avatar || '/default-avatar.png'}
            alt="Avatar"
            fill
            className="rounded-full object-cover border border-gray-700 group-hover:opacity-70"
          />
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs bg-blue-500 text-black px-2 py-0.5 rounded shadow-md opacity-90 group-hover:scale-105 transition z-20">
            edit
          </span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{user.username || 'Creator'}</h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Boosts" value={user.boosts || 0} />
        <Stat label="Tips" value={`$${user.tips?.toFixed(2) || '0.00'}`} />
        <Stat label="Views" value={totalViews} />
      </div>

      <Link
        href="/upload"
        className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white rounded-md font-medium transition"
      >
        + Upload New Reel
      </Link>

      <div>
        <h3 className="text-xl font-semibold mb-4">Your Latest Uploads</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.length > 0 ? (
            clips.map((clip) => (
              <div
                key={clip.id}
                className="bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-700 relative"
              >
                {clip.mediaUrl ? (
                  <video
                    src={clip.mediaUrl}
                    className="w-full h-40 object-cover"
                    controls
                  />
                ) : (
                  <div className="h-40 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                    No video uploaded
                  </div>
                )}

                <div className="relative p-3 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h4 className="text-sm font-semibold truncate">{clip.title || 'Untitled'}</h4>
                  <p className="text-xs text-gray-300">
                    Views: {clip.views || 0} • Tips: ${clip.tips?.toFixed(2) || '0.00'}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleTip(clip.uid || user.uid)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1 rounded transition"
                    >
                      💸 Tip Creator
                    </button>
                    <button
                      onClick={() => setActiveClipId(clip.id)}
                      className="text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20 transition"
                    >
                       Comment
                    </button>
                  </div>
                </div>

                {/* Comments Modal */}
                {activeClipId === clip.id && (
                  <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                    <div className="bg-[#121212] text-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
                      <button
                        onClick={() => setActiveClipId(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                      >
                        <FaTimes />
                      </button>

                      <h2 className="text-xl font-semibold mb-4">💬 Comments</h2>
                      <div className="space-y-3 max-h-64 overflow-y-auto mb-4 border border-zinc-800 p-2 rounded bg-zinc-900/60">
                        {comments[clip.id]?.length > 0 ? (
                          comments[clip.id].map((c, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                              <Image
                                src={c.avatar || "/default-avatar.png"}
                                alt="user"
                                width={24}
                                height={24}
                                className="rounded-full object-cover"
                              />
                              <div className="bg-zinc-800 px-3 py-2 rounded-lg w-full">
                                <p className="text-xs text-white font-semibold">{c.user || 'Anon'}</p>
                                <p className="text-sm text-gray-300">{c.text}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No comments yet.</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 p-2 rounded bg-zinc-800 text-white outline-none border border-zinc-600"
                        />
                        <button
                          onClick={() => handleSubmitComment(clip.id)}
                          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-400">No clips uploaded yet.</p>
          )}
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
