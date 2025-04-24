'use client';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Movie } from "@/lib/constants";
import { cn } from "@/lib/utils";
import CommentModal from "@/components/CommentModal";
import { FaCommentDots } from "react-icons/fa6";

interface MovieCardProps {
  movie: Movie;
  className?: string;
  showStats?: boolean;
}

export default function MovieCard({ movie, className, showStats = false }: MovieCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);

  const href =
    movie.href || (movie.overview === "Boosted Creator"
      ? `/creator/${encodeURIComponent(movie.title)}`
      : "#");

  const boostedGlowClasses =
    movie.overview === "Boosted Creator"
      ? "border-2 border-yellow-500 shadow-[0_0_25px_rgba(255,215,0,0.6)] hover:shadow-[0_0_35px_rgba(255,215,0,0.8)]"
      : "";

  // ✅ Only fetch creator name for Boosted Creators
  useEffect(() => {
    const fetchCreatorName = async () => {
      if (movie.overview !== "Boosted Creator" || !movie.userId) return;

      try {
        const userRef = doc(db, "users", movie.userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCreatorName(userData.username ?? null);
        } else {
          console.warn("❌ No user found in Firestore for ID:", movie.userId);
        }
      } catch (error) {
        console.error("🔥 Error fetching creator name:", error);
      }
    };

    fetchCreatorName();
  }, [movie.overview, movie.userId]);

  return (
    <>
      <Link href={href} className="block group">
        <div
          className={cn(
            "relative aspect-[2/3] rounded overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:z-10",
            boostedGlowClasses,
            className,
          )}
        >
          {movie.poster_path ? (
            <div className="relative w-full h-0 pb-[125%] rounded overflow-hidden">
              <Image
                src={movie.poster_path}
                alt={movie.title || "Poster"}
                fill
                className="object-cover object-center rounded"
                priority
              />
            </div>
          ) : (
            <div className="bg-gray-800 w-full h-full flex items-center justify-center text-white">
              No Image
            </div>
          )}

          {/* ✅ Creator name overlay ONLY for Boosted */}
          {movie.overview === "Boosted Creator" && creatorName && (
            <div className="absolute bottom-0 w-full bg-black/70 text-white text-xs text-center py-1">
              Creator: {creatorName}
            </div>
          )}

          {/* Boosted badge */}
          {movie.overview === "Boosted Creator" && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Boosted
            </div>
          )}
        </div>
      </Link>

     

      {/* Stats + Comment */}
      {showStats && (
        <div className="mt-2 px-1 text-sm text-gray-300 flex items-center justify-between">
          <div>
            <strong className="text-white block">{movie.title}</strong>
            <span className="text-xs">Views: 0 • Tips: $0.00</span>
          </div>

          <button
            onClick={() => setShowComments(true)}
            className="text-blue-400 hover:text-white transition text-sm"
            title="Comment"
          >
            <FaCommentDots className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Comment Modal */}
      <CommentModal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        clipId={movie.id ? String(movie.id) : ""}
      />
    </>
  );
}
