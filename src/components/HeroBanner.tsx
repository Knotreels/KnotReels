'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import MovieRow from '@/components/MovieRow';

interface HeroBannerProps {
  boosted?: any[];
}

const HeroBanner = ({ boosted = [] }: HeroBannerProps) => {
  const pathname = usePathname();
  const isBrowsePage = pathname?.includes('/browse');

  return (
    <section className="relative flex flex-col items-start justify-start min-h-screen bg-black text-white px-4 overflow-hidden">
      {/* 🔁 Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-center bg-cover scale-110 animate-zoomSlow opacity-20 z-0"
        style={{ backgroundImage: "url('/banner.jpg')" }}
      />

      <div className="z-10 w-full max-w-7xl mx-auto pt-8 md:pt-12 px-4">
        {/* 🏷️ Title */}
        <motion.h1
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 10, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold mb-1 tracking-wide"
        >
          Knot
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              delay: 0.6,
              duration: 0.6,
              repeat: 1,
              repeatType: 'mirror',
            }}
            className="text-blue-500 inline-block"
          >
            Reels
          </motion.span>
        </motion.h1>

        {/* ✨ Subtitle */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-2xl md:text-3xl font-semibold mb-6"
        >
          Entert<span className="text-blue-500">A.I</span>nment
        </motion.h2>

        {/* 🔘 Auth Buttons */}
        {!isBrowsePage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="flex gap-4 mb-8"
          >
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm md:text-base font-medium"
            >
              Sign Up
            </Link>
            <Link
              href="/login"
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md text-sm md:text-base font-medium"
            >
              Log In
            </Link>
          </motion.div>
        )}

        {/* 🔥 Boosted Creators Carousel */}
        {isBrowsePage && boosted.length > 0 && (
          <>
            <div className="mt-28 px-4 md:px-8">
              <MovieRow
                title="🔥 Boosted Creators"
                cardSize="large"
                autoScroll
                scrollSpeed={4000}
                movies={boosted.map((creator, index) => ({
                  id: index,
                  title: creator.title,
                  overview: creator.description,
                  poster_path: creator.thumbnail,
                  backdrop_path: creator.thumbnail,
                  release_date: '',
                  genre_ids: [],
                  vote_average: 0,
                  username: creator.username,
                }))}
              />
            </div>

            {/* ⭐ Boost Info (right below carousel) */}
            <div className="mt-6">
              <div className="bg-[#141414] border border-blue-600 rounded-lg p-6 text-left max-w-3xl ml-16">
                <h2 className="text-xl font-bold text-white mb-2">
                  Get Boosted. Get Seen. 🌟
                </h2>
                <p className="text-gray-400 text-sm">
                  Once your content receives{' '}
                  <span className="text-blue-400 font-semibold">5 Boosts</span>, your
                  profile gets featured in the{' '}
                  <span className="text-blue-500 font-semibold">Boosted Creators</span>{' '}
                  carousel for everyone to discover!
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
