'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';

import HeroBanner from '@/components/HeroBanner';
import MovieRow from '@/components/MovieRow';
import Footer from '@/components/Footer';
import { getBoostedCreators } from '@/lib/fetchBoostedCreators';
import { CATEGORIES } from '@/lib/constants';

export default function BrowsePage() {
  const [boosted, setBoosted] = useState<any[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoosted = async () => {
      const creators = await getBoostedCreators();
      setBoosted(creators);
    };

    fetchBoosted();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData?.avatar) {
          setAvatarUrl(userData.avatar);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* 👤 Avatar → Profile link */}
      {avatarUrl && (
        <Link
          href="/dashboard/profiles"
          className="absolute top-6 right-6 z-30"
        >
          <Image
            src={avatarUrl}
            alt="Profile"
            width={44}
            height={44}
            className="rounded-full border border-white hover:scale-105 transition"
          />
        </Link>
      )}

      {/* ✅ HeroBanner with boosted creators */}
      <div className="-mb-4">
        <HeroBanner boosted={boosted} />
      </div>

      <section className="relative z-10 w-full px-6 space-y-10 pb-14">
        {/* Categories */}
        <MovieRow
          title=" Categories"
          cardSize="large"
          movies={CATEGORIES.map((category, index) => ({
            id: index,
            title: category.title || 'Untitled',
            overview: '',
            poster_path: category.thumbnail || '',
            backdrop_path: category.thumbnail || '',
            release_date: '',
            genre_ids: [],
            vote_average: 0,
            href: `/category/${category.title.toLowerCase().replace(/\s+/g, '-')}`,
          }))}
        />
      </section>

      <Footer />
    </>
  );
}
