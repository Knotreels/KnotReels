'use client';

import Image from "next/image";
import Link from "next/link";
import type { Movie } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export default function MovieCard({ movie, className }: MovieCardProps) {
  const href = movie.href || (movie.overview === 'Boosted Creator'
    ? `/creator/${encodeURIComponent(movie.title)}`
    : '#');

  const boostedGlowClasses = movie.overview === 'Boosted Creator'
    ? "border-2 border-yellow-500 shadow-[0_0_25px_rgba(255,215,0,0.6)] hover:shadow-[0_0_35px_rgba(255,215,0,0.8)]"
    : "";

  return (
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

        {/* ✅ Show creator name below on hover */}
        {movie.username && (
          <div className="absolute bottom-0 w-full bg-black/70 text-white text-xs text-center py-1 opacity-0 group-hover:opacity-100 transition">
            {movie.username}
          </div>
        )}
      </div>
    </Link>
  );
}
