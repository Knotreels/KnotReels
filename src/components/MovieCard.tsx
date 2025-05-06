'use client';

import {
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import type { Movie } from '@/lib/constants';
import { cn } from '@/lib/utils';
import CommentModal from '@/components/CommentModal';
import { FaCommentDots } from 'react-icons/fa6';

// Extend your Movie type with clip-specific fields
type Clip = Movie & {
  mediaUrl?: string;
  tips?: number;
  views?: number;
  userId?: string;
  href?: string;
};

interface MovieCardProps {
  movie: Clip;
  className?: string;
  showStats?: boolean;
}

export default function MovieCard({
  movie,
  className,
  showStats = false
}: MovieCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [viewCount, setViewCount] = useState<number>(movie.views ?? 0);
  const hasCountedRef = useRef(false);

  const href =
    movie.href ||
    (movie.overview === 'Boosted Creator'
      ? `/creator/${encodeURIComponent(movie.title)}`
      : '#');

  const boostedGlowClasses =
    movie.overview === 'Boosted Creator'
      ? 'border-2 border-yellow-500 shadow-[0_0_25px_rgba(255,215,0,0.6)] hover:shadow-[0_0_35px_rgba(255,215,0,0.8)]'
      : '';

  // (Optional) fetch username for Boosted Creators
  useEffect(() => {
    if (movie.overview !== 'Boosted Creator' || !movie.userId) return;
    (async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', movie.userId));
        if (userSnap.exists()) {
          setCreatorName((userSnap.data() as any).username);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [movie.overview, movie.userId]);

  // Subscribe in real time to the clip’s view count
  useEffect(() => {
    if (!showStats || !movie.id) return;
    const clipRef = doc(db, 'clips', String(movie.id));
    const unsub = onSnapshot(clipRef, snap => {
      setViewCount((snap.data() as any)?.views ?? 0);
    });
    return () => unsub();
  }, [showStats, movie.id]);

  // Fire once on the first play
  const handlePlay = async () => {
    if (!showStats || hasCountedRef.current || !movie.id) return;
    hasCountedRef.current = true;
    const clipRef = doc(db, 'clips', String(movie.id));
    await updateDoc(clipRef, { views: increment(1) });
  };

  return (
    <>
      <Link href={href} className="block group">
        <div
          className={cn(
            'relative overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:z-10',
            boostedGlowClasses,
            className
          )}
        >
          {showStats && movie.mediaUrl ? (
            <video
              src={movie.mediaUrl}
              controls
              onPlay={handlePlay}
              className="w-full h-[200px] object-cover"
            />
          ) : movie.poster_path ? (
            <div className="relative w-full h-0 pb-[125%]">
              <Image
                src={movie.poster_path}
                alt={movie.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="bg-gray-800 w-full h-[200px] flex items-center justify-center text-white">
              No Image
            </div>
          )}

          {movie.overview === 'Boosted Creator' && creatorName && (
            <div className="absolute bottom-0 w-full bg-black/70 text-xs text-white text-center py-1">
              Creator: {creatorName}
            </div>
          )}
          {movie.overview === 'Boosted Creator' && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-xs text-white font-semibold px-2 py-1 rounded">
              Boosted
            </div>
          )}
        </div>
      </Link>

      {showStats && (
        <div className="mt-2 px-1 text-sm text-gray-300 flex items-center justify-between">
          <div>
            <strong className="text-white block truncate">{movie.title}</strong>
            <span className="text-xs">
              Views: {viewCount} • Tips: ${(movie.tips ?? 0).toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => setShowComments(true)}
            className="text-blue-400 hover:text-white transition"
            title="Comment"
          >
            <FaCommentDots className="w-4 h-4" />
          </button>
        </div>
      )}

      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        clipId={String(movie.id)}
      />
    </>
  );
}
