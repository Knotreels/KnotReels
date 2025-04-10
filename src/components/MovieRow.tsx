"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Movie } from "@/lib/constants";
import MovieCard from "./MovieCard";
import { cn } from "@/lib/utils";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  className?: string;
  cardSize?: "small" | "large";
  autoScroll?: boolean;
  scrollSpeed?: number; // ms between scrolls
}

export default function MovieRow({
  title,
  movies,
  className,
  cardSize = "small",
  autoScroll = false,
  scrollSpeed = 3000,
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // 🚀 Auto scroll effect
  useEffect(() => {
    if (!autoScroll || !rowRef.current) return;

    const interval = setInterval(() => {
      rowRef.current?.scrollBy({
        left: rowRef.current.clientWidth * 0.5,
        behavior: "smooth",
      });
    }, scrollSpeed);

    return () => clearInterval(interval);
  }, [autoScroll, scrollSpeed]);

  const handleScroll = () => {
    if (!rowRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scrollToDirection = (direction: "left" | "right") => {
    if (!rowRef.current) return;

    const { clientWidth } = rowRef.current;
    const scrollAmount = direction === "left" ? -clientWidth * 0.8 : clientWidth * 0.8;

    rowRef.current.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className={cn("mb-8", className)}>
      <h2 className="text-xl md:text-2xl font-medium text-white mb-2 pl-4 md:pl-8">
        {title}
      </h2>

      <div className="group/row relative">
        {/* Arrows (optional if you want to keep them) */}
        {showLeftArrow && (
          <button
            className="absolute left-0 z-10 h-full px-2 bg-black/40 opacity-0 group-hover/row:opacity-100 transition duration-200"
            onClick={() => scrollToDirection("left")}
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>
        )}

        {showRightArrow && (
          <button
            className="absolute right-0 z-10 h-full px-2 bg-black/40 opacity-0 group-hover/row:opacity-100 transition duration-200"
            onClick={() => scrollToDirection("right")}
            aria-label="Scroll right"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        )}

        {/* Movie cards */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto scrollbar-hide snap-x pl-4 md:pl-8 pr-8 py-4 scroll-smooth"
        >
          {movies.map((movie) => (
            <div
            key={movie.id}
            className={cn(
              "flex-none pr-2 group/card",
              cardSize === "large"
                ? "w-[160px] sm:w-[180px] md:w-[200px]" // ✅ slightly wider for 4:5
                : "w-[110px] sm:w-[130px] md:w-[150px]"
            )}
          >
            <MovieCard movie={movie} />
          </div>
          
          ))}
        </div>
      </div>
    </div>
  );
}
