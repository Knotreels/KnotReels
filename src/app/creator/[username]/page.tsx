'use client';

import React, { useEffect, useState } from 'react';
import { useParams }                  from 'next/navigation';
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db }                         from '@/firebase/config';
import Image                          from 'next/image';
import LogoLoader                     from '@/components/LogoLoader';
import { Button }                     from '@/components/ui/button';
import { useAuth }                    from '@/context/AuthContext';
import { TipModal }                   from '@/components/TipModal';
import { toast }                      from '@/hooks/use-toast';
import { FaTimes }                    from 'react-icons/fa';
import CommentModal                   from '@/components/CommentModal';

export default function PublicProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();

  const [creator, setCreator]         = useState<any>(null);
  const [clips, setClips]             = useState<any[]>([]);
  const [commentsMap, setComments]    = useState<Record<string, any[]>>({});
  const [loading, setLoading]         = useState(true);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [hasBoosted, setHasBoosted]     = useState(false);

  useEffect(() => {
    async function fetchCreator() {
      // 1) Find the user by username
      const userSnap = await getDocs(
        query(collection(db, 'users'), where('username', '==', username))
      );
      if (userSnap.empty) {
        setCreator(null);
        setLoading(false);
        return;
      }
      const userDoc = userSnap.docs[0];
      const data    = { id: userDoc.id, ...userDoc.data() };
      setCreator(data);
      setIsOwnProfile(currentUser?.uid === data.id);

      // 2) Load their clips from the TOP-LEVEL "clips" collection
      const clipSnap = await getDocs(
        query(
          collection(db, 'clips'),
          where('uid', '==', data.id),       // <— use data.id here
          orderBy('createdAt', 'desc')
        )
      );
      const list = clipSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setClips(list);

      // 3) Subscribe to comments on each clip
      list.forEach(clip => {
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

      // 4) Check if current user has already boosted
      if (currentUser) {
        const boostRef = doc(db, 'users', data.id, 'boosts', currentUser.uid);
        const boostSnap = await getDoc(boostRef);
        setHasBoosted(boostSnap.exists());
      }

      setLoading(false);
    }
    fetchCreator();
  }, [username, currentUser]);

  const handleBoostClick = async () => {
    if (!currentUser || !creator || hasBoosted) return;
    try {
      await setDoc(
        doc(db, 'users', creator.id, 'boosts', currentUser.uid),
        { createdAt: serverTimestamp() }
      );
      await updateDoc(doc(db, 'users', creator.id), {
        boosts: increment(1)
      });
      toast({ title: '🎉 Boost sent!', variant: 'default' });
      setHasBoosted(true);
      // refresh creator boosts
      const fresh = await getDoc(doc(db, 'users', creator.id));
      setCreator({ id: fresh.id, ...fresh.data() });
    } catch {
      toast({ title: 'Unable to boost', variant: 'destructive' });
    }
  };

  if (loading) return <LogoLoader />;
  if (!creator) return <p className="p-6 text-white">Creator not found.</p>;

  return (
    <div className="space-y-10 px-6 pt-10 text-white">
      {/* Header */}
      <div className="flex items-start gap-6">
        <Image
          src={creator.avatar || '/default-avatar.png'}
          alt={creator.username}
          width={64}
          height={64}
          className="rounded-full border border-gray-700"
        />
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">{creator.username}</h2>
            {!isOwnProfile && (
              <>
                <Button
                  onClick={handleBoostClick}
                  disabled={hasBoosted}
                  className={hasBoosted ? 'opacity-50' : ''}
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

      {/* Clips Grid */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Clips</h3>
        {clips.length === 0 ? (
          <p className="text-gray-500">No clips yet.</p>
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
                  <div className="h-48 bg-gray-800 flex items-center justify-center text-gray-400">
                    No video
                  </div>
                )}
                <div className="p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <h4 className="text-sm font-semibold truncate">{clip.title}</h4>
                  <button
                    onClick={() =>
                      setActiveClipId(id => (id === clip.id ? null : clip.id))
                    }
                    className="mt-2 text-xs bg-white/10 px-3 py-1 rounded hover:bg-white/20"
                  >
                    Comments ({commentsMap[clip.id]?.length || 0})
                  </button>
                </div>

                {/* Shared CommentModal */}
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
    </div>
  );
}
