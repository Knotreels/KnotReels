'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import LogoLoader from '@/components/LogoLoader';
import FlipComicReader, { ComicPage } from '@/components/comics/FlipComicReader';

export default function ComicIssuePage() {
  const { slug, issueNumber } = useParams();
  const issueNum = Number(issueNumber);

  const [pages, setPages] = useState<ComicPage[]>([]);
  const [coverImage, setCoverImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 1) get cover from comics collection
      const cSnap = await getDocs(query(collection(db, 'comics'), where('slug', '==', slug)));
      const comic = cSnap.docs[0]?.data() as any;
      if (comic?.coverUrl) setCoverImage(comic.coverUrl);

      // 2) get the issue doc
      const iSnap = await getDocs(
        query(
          collection(db, 'issues'),
          where('comicSlug', '==', slug),
          where('issueNumber', '==', issueNum)
        )
      );
      const issueDoc = iSnap.docs[0]?.data() as any;
      setPages(issueDoc?.pages || []);
      setLoading(false);
    }
    load();
  }, [slug, issueNum]);

  if (loading) return <LogoLoader />;
  if (!pages.length) return <div className="p-8 text-white bg-black">Issue not found.</div>;

  return (
    <FlipComicReader
      pages={pages}
      coverImage={coverImage}
      onClose={() => window.history.back()}
    />
  );
}
