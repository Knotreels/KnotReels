'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Movie } from "@/lib/constants";
import { cn } from "@/lib/utils";
import CommentModal from "@/components/CommentModal";
import { FaCommentDots } from "react-icons/fa6";

interface MovieCardProps {
  movie: Movie;
  className?: string;
  showStats?: boolean; // ✅ NEW
}

export default function MovieCard({ movie, className, showStats = false }: MovieCardProps) {
  const [showComments, setShowComments] = useState(false);

  const href =
    movie.href || (movie.overview === "Boosted Creator"
      ? `/creator/${encodeURIComponent(movie.title)}`
      : "#");

  const boostedGlowClasses =
    movie.overview === "Boosted Creator"
      ? "border-2 border-yellow-500 shadow-[0_0_25px_rgba(255,215,0,0.6)] hover:shadow-[0_0_35px_rgba(255,215,0,0.8)]"
      : "";

  return (
    <>
      <Link href={href} className="block group">
        <div
          className={cn(
            "relative aspect-[2/3] rounded overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:z-10",
            boostedGlowClasses,
            className
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

          {movie.username && (
            <div className="absolute bottom-0 w-full bg-black/70 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition">
              {movie.username}
            </div>
          )}
        </div>
      </Link>

      {/* 🧾 Creator Stats & Comments only for Reels */}
      {showStats && (
        <div className="mt-2 px-1 text-sm text-gray-300 flex items-center justify-between">
          <div>
            <strong className="text-white block">{movie.title}</strong>
            <span className="text-xs">Views: 0 • Tips: $0.00</span>
          </div>

          {/* 🗨️ Comment Button */}
          <button
            onClick={() => setShowComments(true)}
            className="text-blue-400 hover:text-white transition text-sm"
            title="Comment"
          >
            <FaCommentDots className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 🪟 Comment Modal */}
      <CommentModal isOpen={showComments} onClose={() => setShowComments(false)} />
    </>
  );
}
