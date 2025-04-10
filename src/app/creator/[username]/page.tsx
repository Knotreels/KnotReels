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
  doc,
  getDoc,
} from 'firebase/firestore';
import Image from 'next/image';
import LogoLoader from '@/components/LogoLoader';
import { Button } from '@/components/ui/button';
import { handleBoost } from '@/lib/firestore/handleBoost';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { TipModal } from '@/components/TipModal'; // ✅ Your modal

export default function PublicProfilePage() {
  const { username } = useParams();
  const [creator, setCreator] = useState<any>(null);
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        );
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          const userDoc = userSnap.docs[0];
          const userData = { id: userDoc.id, ...userDoc.data() };
          setCreator(userData);

          const clipsQuery = query(
            collection(db, 'clips'),
            where('uid', '==', userDoc.id),
            orderBy('createdAt', 'desc')
          );
          const clipsSnap = await getDocs(clipsQuery);
          const clipsData = clipsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setClips(clipsData);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleBoostClick = async () => {
    if (!creator?.id) return toast({ title: 'Missing creator ID.' });
    if (!currentUser?.uid) return toast({ title: 'You must be logged in to boost.' });

    if (currentUser.uid === creator.id) {
      return toast({ title: "You can't boost yourself!" });
    }

    try {
      const prevBoosts = creator.boosts || 0;
      const success = await handleBoost(creator.id, currentUser.uid);

    if (success && prevBoosts < 10) {
      setCreator((prev: any) => ({
    ...prev,
    boosts: prevBoosts + 1,
  }));
}

    } catch (error) {
      console.error('❌ Boost failed:', error);
      toast({
        title: '⚠️ Boost Failed',
        description: 'Something went wrong while boosting. Try again.',
      });
    }
  };

  if (loading) return <LogoLoader />;
  if (!creator) return <div className="p-6 text-white">Creator not found.</div>;

  return (
    <div className="space-y-10 px-6 pt-10 text-white">
      {/* Creator Info */}
      <div className="flex items-center gap-6">
        <Image
          src={creator.avatar || '/default-avatar.png'}
          alt="Avatar"
          width={64}
          height={64}
          className="rounded-full object-cover border border-gray-700"
        />
        <div>
          <h2 className="text-2xl font-semibold">{creator.username}</h2>
          <p className="text-sm text-gray-400">Featured Creator</p>

          <div className="flex gap-3 mt-3">
            <Button
              onClick={handleBoostClick}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              🚀 Boost Creator
            </Button>

            {/* ✅ Cleaner TipModal */}
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
          {clips.length > 0 ? (
            clips.map((clip) => (
              <div
                key={clip.id}
                className="bg-[#1a1a1a] rounded-md overflow-hidden border border-gray-700"
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
                <div className="p-3">
                  <h4 className="font-medium text-sm">
                    {clip.title || 'Untitled'}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Views: {clip.views || 0}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No reels found.</p>
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
