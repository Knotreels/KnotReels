// ProfilePage.tsx (updated)
'use client';
import { useEffect, useState, useRef, ChangeEvent } from 'react';
import { auth, db, storage } from '@/firebase/config';
import {
  doc, onSnapshot, collection, query, where,
  getDocs, orderBy, updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import LogoLoader from '@/components/LogoLoader';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);
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
          ...(doc.data() as { views?: number }),
        }));

        setClips(clipData);

        // ✅ Calculate total views
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

  if (loading) return <LogoLoader />;
  if (!user) return <div className="p-6 text-white">User not found.</div>;

  return (
    <div className="space-y-10 px-6 pt-10 text-white">
      <div className="flex items-center gap-6">
        <div className="relative group w-16 h-16">
          <input type="file" accept="image/*" onChange={handleAvatarChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
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

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Boosts" value={user.boosts || 0} />
        <Stat label="Tips" value={`$${user.tips?.toFixed(2) || '0.00'}`} />
        <Stat label="Views" value={totalViews} />
      </div>

      <Link href="/upload" className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white rounded-md font-medium transition">
        + Upload New Reel
      </Link>

      <div>
        <h3 className="text-xl font-semibold mb-4">Your Latest Uploads</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.length > 0 ? (
            clips.map((clip) => (
              <div key={clip.id} className="bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-700">
                {clip.mediaUrl ? (
                  <video src={clip.mediaUrl} className="w-full h-40 object-cover" controls />
                ) : (
                  <div className="h-40 bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                    No video uploaded
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <h4 className="font-medium text-sm text-white">
                    {clip.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-gray-400">
                    Views: {clip.views || 0} • Tips: ${clip.tips?.toFixed(2) || '0.00'}
                  </p>
                  <button
                    onClick={() => handleTip(clip.uid || user.uid)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-1 rounded transition"
                  >
                    💸 Tip Creator
                  </button>
                </div>
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
