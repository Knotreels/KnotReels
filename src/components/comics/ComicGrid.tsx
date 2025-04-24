// components/comics/ComicGrid.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import Link from 'next/link';
import Image from 'next/image';

interface Comic {
  slug: string;
  title: string;
  coverUrl: string;
  author: string;
}

const ComicGrid: React.FC = () => {
  const [comics, setComics] = useState<Comic[]>([]);

  useEffect(() => {
    const fetchComics = async () => {
      const snap = await getDocs(collection(db, 'comics'));
      const data = snap.docs.map(doc => ({
        slug: doc.id,
        ...(doc.data() as Omit<Comic, 'slug'>),
      }));
      setComics(data);
    };
    fetchComics();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {comics.map(({ slug, title, coverUrl, author }) => (
        <Link
          key={slug}
          href={`/comics/${slug}/1`}
          className="block bg-zinc-900 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform"
        >
          <div className="relative w-full h-48">
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white truncate">
              {title}
            </h2>
            <p className="text-sm text-gray-400 truncate">
              By {author}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ComicGrid;
